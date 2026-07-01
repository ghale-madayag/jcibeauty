"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import { SITE } from "@/lib/constants";
import { useCart } from "@/features/cart/cart.store";
import { useMounted } from "@/hooks/use-mounted";
import { checkoutSchema } from "@/features/orders/order.schema";
import {
  createCheckoutAction,
  validateCouponAction,
} from "@/features/orders/checkout.actions";

const formSchema = checkoutSchema.omit({ items: true, couponCode: true });
type FormValues = z.infer<typeof formSchema>;

const SHIPPING_FLAT = 99;

export default function CheckoutPage() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());

  const [discount, setDiscount] = React.useState(0);
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCode, setAppliedCode] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { country: "Philippines" },
  });

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto max-w-2xl py-28 text-center">
        <h1 className="font-serif text-3xl">Your cart is empty</h1>
        <Button asChild variant="gold" className="mt-6">
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    );
  }

  const shipping =
    subtotal >= SITE.freeShippingThreshold ? 0 : SHIPPING_FLAT;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function applyCoupon() {
    const res = await validateCouponAction(couponCode, subtotal);
    if (res.valid) {
      setDiscount(res.discount);
      setAppliedCode(res.code);
      toast.success(`Coupon ${res.code} applied`);
    } else {
      setDiscount(0);
      setAppliedCode(null);
      toast.error(res.reason);
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await createCheckoutAction({
      ...values,
      couponCode: appliedCode ?? undefined,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    if (res.ok && res.url) {
      // Don't clear the cart here — the customer may cancel on Stripe and come
      // back. The cart is emptied on the success page after payment is confirmed.
      window.location.href = res.url;
    } else {
      setSubmitting(false);
      toast.error(res.error ?? "Checkout failed.");
    }
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <h1 className="font-serif text-4xl">Checkout</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px]"
      >
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl">Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <Input {...register("fullName")} placeholder="Jane Doe" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <Input {...register("phone")} placeholder="0917 000 0000" />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">Shipping Address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Address line 1"
                error={errors.line1?.message}
                className="sm:col-span-2"
              >
                <Input {...register("line1")} placeholder="123 Beauty Ave" />
              </Field>
              <Field label="Address line 2" className="sm:col-span-2">
                <Input {...register("line2")} placeholder="Apt, suite (optional)" />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <Input {...register("city")} />
              </Field>
              <Field label="State / Province">
                <Input {...register("state")} />
              </Field>
              <Field label="Postal code" error={errors.postalCode?.message}>
                <Input {...register("postalCode")} />
              </Field>
              <Field label="Country" error={errors.country?.message}>
                <Input
                  {...register("country")}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                  className="cursor-not-allowed bg-muted/40 text-muted-foreground"
                />
              </Field>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border bg-card p-6">
          <h2 className="font-serif text-xl">Order Summary</h2>
          <Separator className="my-4" />
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatMoney(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />

          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
            />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <span>Discount ({appliedCode})</span>
                <span>−{formatMoney(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatMoney(shipping)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Pay {formatMoney(total)}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secure payment powered by Stripe.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
