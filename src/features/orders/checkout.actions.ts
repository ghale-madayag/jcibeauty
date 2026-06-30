"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { toStripeAmount } from "@/lib/money";
import { validateCoupon } from "@/features/coupons/coupon.service";
import { checkoutSchema, type CheckoutInput } from "./order.schema";
import { priceCheckout, createOrder, orderService } from "./order.service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY || "PHP").toLowerCase();

/**
 * Build a fully-qualified, URL-encoded image URL for Stripe. Product image
 * paths can contain spaces (e.g. "/images/product assets/x.webp"), which are
 * not valid URLs until encoded. Returns undefined if the URL can't be formed.
 */
function absoluteImage(image: string | null): string[] | undefined {
  if (!image) return undefined;
  try {
    const url = new URL(image, APP_URL).toString();
    // Stripe can't display images it can't reach (e.g. localhost), but only
    // rejects malformed URLs — so we only need a well-formed absolute URL.
    return [url];
  } catch {
    return undefined;
  }
}

export async function validateCouponAction(code: string, subtotal: number) {
  if (!code.trim()) return { valid: false as const, reason: "Enter a code." };
  return validateCoupon(code, subtotal);
}

export async function createCheckoutAction(input: CheckoutInput): Promise<{
  ok: boolean;
  url?: string;
  error?: string;
}> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please complete all required fields." };
  }

  const session = await auth();
  const totals = await priceCheckout(parsed.data.items, parsed.data.couponCode);
  if (totals.lines.length === 0) {
    return { ok: false, error: "Your cart is empty or items are unavailable." };
  }

  const order = await createOrder(parsed.data, totals, session?.user?.id);

  // Dev fallback: no Stripe configured -> simulate a successful payment
  // (this also sends the order confirmation email).
  if (!stripe) {
    await orderService.markPaidById(order.id);
    return {
      ok: true,
      url: `${APP_URL}/checkout/success?order=${order.orderNumber}&dev=1`,
    };
  }

  // Build Stripe line items + optional one-off discount coupon.
  const lineItems = totals.lines.map((l) => ({
    quantity: l.quantity,
    price_data: {
      currency: CURRENCY,
      unit_amount: toStripeAmount(l.price),
      product_data: {
        name: l.name,
        images: absoluteImage(l.image),
      },
    },
  }));

  if (totals.shippingTotal > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: CURRENCY,
        unit_amount: toStripeAmount(totals.shippingTotal),
        product_data: { name: "Shipping", images: undefined },
      },
    });
  }

  const discounts =
    totals.discountTotal > 0
      ? await (async () => {
          const coupon = await stripe.coupons.create({
            amount_off: toStripeAmount(totals.discountTotal),
            currency: CURRENCY,
            duration: "once",
            name: "Discount",
          });
          return [{ coupon: coupon.id }];
        })()
      : undefined;

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: parsed.data.email,
    line_items: lineItems,
    discounts,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    success_url: `${APP_URL}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/checkout?canceled=1`,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkout.id },
  });

  return { ok: true, url: checkout.url ?? undefined };
}
