import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { generateOrderNumber } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { validateCoupon } from "@/features/coupons/coupon.service";
import { sendOrderConfirmation } from "./order.email";
import type { CheckoutInput } from "./order.schema";

export interface PricedLine {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderTotals {
  lines: PricedLine[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  couponId: string | null;
}

const SHIPPING_FLAT = 99;

/** Re-price a cart from authoritative DB data and apply a coupon. */
export async function priceCheckout(
  items: { productId: string; quantity: number }[],
  couponCode?: string,
): Promise<OrderTotals> {
  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const lines: PricedLine[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const price = toNumber(product.price);
    const quantity = Math.min(item.quantity, Math.max(product.stock, 1));
    lines.push({
      productId: product.id,
      name: product.name,
      image: product.images[0]?.url ?? null,
      price,
      quantity,
      lineTotal: Math.round(price * quantity * 100) / 100,
    });
  }

  const subtotal = Math.round(
    lines.reduce((s, l) => s + l.lineTotal, 0) * 100,
  ) / 100;

  let discountTotal = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal);
    if (result.valid) {
      discountTotal = result.discount;
      couponId = result.couponId;
    }
  }

  const shippingTotal =
    subtotal >= SITE.freeShippingThreshold || subtotal === 0
      ? 0
      : SHIPPING_FLAT;
  const taxTotal = 0;
  const total =
    Math.round((subtotal - discountTotal + shippingTotal + taxTotal) * 100) /
    100;

  return {
    lines,
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    total,
    couponId,
  };
}

/** Persist an order in PENDING/UNPAID state. */
export async function createOrder(
  input: CheckoutInput,
  totals: OrderTotals,
  userId?: string,
) {
  return db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: userId ?? null,
      email: input.email,
      status: "PENDING",
      paymentStatus: "UNPAID",
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      shippingTotal: totals.shippingTotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      couponId: totals.couponId,
      shippingAddress: {
        fullName: input.fullName,
        line1: input.line1,
        line2: input.line2 ?? null,
        city: input.city,
        state: input.state ?? null,
        postalCode: input.postalCode,
        country: input.country,
        phone: input.phone ?? null,
      },
      items: {
        create: totals.lines.map((l) => ({
          productId: l.productId,
          name: l.name,
          image: l.image,
          price: l.price,
          quantity: l.quantity,
        })),
      },
    },
    include: { items: true },
  });
}

export const orderService = {
  priceCheckout,
  createOrder,

  async markPaid(stripeSessionId: string, paymentIntentId: string) {
    const order = await db.order.findFirst({ where: { stripeSessionId } });
    if (!order || order.paymentStatus === "PAID") return order;
    const updated = await db.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
        stripePaymentIntentId: paymentIntentId,
      },
    });
    await sendOrderConfirmation(updated.id);
    return updated;
  },

  /** Mark an order paid by id (used by the dev fallback when Stripe is off). */
  async markPaidById(orderId: string) {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentStatus === "PAID") return order;
    const updated = await db.order.update({
      where: { id: orderId },
      data: { status: "PAID", paymentStatus: "PAID" },
    });
    await sendOrderConfirmation(updated.id);
    return updated;
  },

  listForUser(userId: string) {
    return db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  },

  getByNumber(orderNumber: string) {
    return db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
  },

  /**
   * Authorized receipt lookup for the (public, guest) success page. Only returns
   * the order if the caller proves ownership via the unguessable Stripe
   * `session_id` (matched against the stored one). `devAllowed` opens the lookup
   * only when Stripe isn't configured (local dev simulated checkout).
   */
  async getReceipt(
    orderNumber: string,
    sessionId: string | undefined,
    devAllowed: boolean,
  ) {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) return null;
    if (devAllowed) return order;
    if (sessionId && order.stripeSessionId === sessionId) return order;
    return null;
  },
};
