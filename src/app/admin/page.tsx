import Link from "next/link";
import { format } from "date-fns";
import {
  Receipt,
  ShoppingBag,
  CalendarDays,
  Users,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { toNumber, formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const now = new Date();
  const [
    revenue,
    orderCount,
    productCount,
    apptCount,
    customerCount,
    recent,
    upcomingAppts,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
    db.order.count(),
    db.product.count(),
    db.appointment.count({
      where: { start: { gte: now }, status: { in: ["CONFIRMED", "PENDING"] } },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    db.appointment.findMany({
      where: { start: { gte: now }, status: { in: ["CONFIRMED", "PENDING"] } },
      orderBy: { start: "asc" },
      take: 6,
      include: {
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: "Revenue",
      value: formatMoney(toNumber(revenue._sum.total)),
      icon: TrendingUp,
    },
    { label: "Orders", value: orderCount, icon: Receipt },
    { label: "Products", value: productCount, icon: ShoppingBag },
    { label: "Upcoming Appts", value: apptCount, icon: CalendarDays },
    { label: "Customers", value: customerCount, icon: Users },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Overview of your store performance.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="size-5 text-gold" />
            </div>
            <p className="mt-3 text-2xl font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-serif text-lg">Upcoming Appointments</h2>
            <Link
              href="/admin/appointments?filter=upcoming"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          {upcomingAppts.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              No upcoming appointments.
            </p>
          ) : (
            <ul className="divide-y">
              {upcomingAppts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 p-5 text-sm">
                  <div>
                    <span className="font-medium">{a.customerName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {a.service.name} · {a.staff.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium">
                      {format(a.start, "MMM d")}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {format(a.start, "h:mm a")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-serif text-lg">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 p-5 text-sm"
                >
                  <div>
                    <span className="font-medium">{o.orderNumber}</span>
                    <span className="block text-xs text-muted-foreground">
                      {o.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={o.paymentStatus === "PAID" ? "gold" : "secondary"}>
                      {o.status}
                    </Badge>
                    <span className="font-medium">
                      {formatMoney(o.total.toString())}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
