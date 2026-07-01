import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import { isStripeConfigured } from "@/lib/stripe";
import { orderService } from "@/features/orders/order.service";
import { ClearCartOnSuccess } from "@/components/shop/clear-cart-on-success";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}) {
  const { order: orderNumber, session_id } = await searchParams;
  // Guest checkout — gate receipt details on the unguessable Stripe session id
  // (open lookup only in the simulated dev checkout when Stripe is off).
  const order = orderNumber
    ? await orderService.getReceipt(orderNumber, session_id, !isStripeConfigured)
    : null;

  return (
    <div className="container-px mx-auto max-w-xl py-24 text-center">
      {/* Empty the cart only now that checkout succeeded — a real Stripe
          success carries session_id (or dev fallback resolves an order);
          cancelling goes to /checkout?canceled=1 and never reaches this page,
          so the cart survives a cancel. */}
      {(order || session_id) && <ClearCartOnSuccess />}
      <CheckCircle2 className="mx-auto size-16 text-gold" />
      <h1 className="mt-6 font-serif text-4xl">Thank you!</h1>
      <p className="mt-3 text-muted-foreground">
        Your order has been placed successfully. A confirmation has been sent to
        your email.
      </p>

      {order && (
        <div className="mt-10 rounded-xl border bg-card p-6 text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order number</span>
            <span className="font-medium">{order.orderNumber}</span>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span>{formatMoney(i.price.toString())}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatMoney(order.total.toString())}</span>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <Button asChild variant="gold">
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
