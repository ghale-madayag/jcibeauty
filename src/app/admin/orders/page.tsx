import { startOfWeek } from "date-fns";
import { ChevronRight, TrendingUp, Banknote, ShoppingBag, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ClickableRow } from "@/components/admin/clickable-row";
import { formatMoney, toNumber } from "@/lib/money";

export default async function AdminOrdersPage() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const [orders, revenueWeek, revenueAll, ordersWeek, pending] =
    await Promise.all([
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } } },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", createdAt: { gte: weekStart } },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),
      db.order.count({ where: { createdAt: { gte: weekStart } } }),
      db.order.count({ where: { paymentStatus: "UNPAID" } }),
    ]);

  const cards = [
    {
      label: "Revenue this week",
      value: formatMoney(toNumber(revenueWeek._sum.total)),
      icon: TrendingUp,
    },
    {
      label: "Total revenue",
      value: formatMoney(toNumber(revenueAll._sum.total)),
      icon: Banknote,
    },
    {
      label: "Orders this week",
      value: String(ordersWeek),
      icon: ShoppingBag,
    },
    {
      label: "Awaiting payment",
      value: String(pending),
      icon: Clock,
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders</p>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <span className="flex size-9 items-center justify-center rounded-full bg-gold/10 text-gold">
                <c.icon className="size-4.5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <ClickableRow key={o.id} href={`/admin/orders/${o.id}`}>
                  <TableCell className="font-medium text-gold">
                    {o.orderNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.email}
                  </TableCell>
                  <TableCell>{o._count.items}</TableCell>
                  <TableCell>{formatMoney(o.total)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={o.paymentStatus === "PAID" ? "gold" : "secondary"}
                    >
                      {o.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </TableCell>
                </ClickableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
