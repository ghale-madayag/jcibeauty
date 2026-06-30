import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";

type ShippingAddress = {
  fullName?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string | null;
  postalCode?: string;
  country?: string;
  phone?: string | null;
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const addr = (order.shippingAddress ?? {}) as ShippingAddress;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {order.createdAt.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={order.paymentStatus === "PAID" ? "gold" : "secondary"}>
            {order.paymentStatus}
          </Badge>
          <Badge variant="outline">{order.status}</Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Items + totals */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-serif text-lg">Items</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(i.price)} × {i.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatMoney(Number(i.price) * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          <dl className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatMoney(order.subtotal)} />
            {Number(order.discountTotal) > 0 && (
              <Row
                label="Discount"
                value={`-${formatMoney(order.discountTotal)}`}
              />
            )}
            <Row
              label="Shipping"
              value={
                Number(order.shippingTotal) === 0
                  ? "Free"
                  : formatMoney(order.shippingTotal)
              }
            />
            {Number(order.taxTotal) > 0 && (
              <Row label="Tax" value={formatMoney(order.taxTotal)} />
            )}
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Customer + shipping */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-serif text-lg">Customer</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <a
                  href={`mailto:${order.email}`}
                  className="hover:text-gold hover:underline"
                >
                  {order.email}
                </a>
              </p>
              {addr.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {addr.phone}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg">
              <MapPin className="size-4 text-gold" /> Shipping address
            </h2>
            {addr.line1 ? (
              <address className="mt-4 text-sm not-italic leading-relaxed text-muted-foreground">
                <span className="block font-medium text-foreground">
                  {addr.fullName}
                </span>
                {addr.line1}
                {addr.line2 ? <>, {addr.line2}</> : null}
                <br />
                {[addr.city, addr.state, addr.postalCode]
                  .filter(Boolean)
                  .join(", ")}
                <br />
                {addr.country}
              </address>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No shipping address on file.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
