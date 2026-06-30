import Link from "next/link";
import {
  format,
  isToday,
  startOfWeek,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  CalendarClock,
  CalendarDays,
  Banknote,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { formatMoney, toNumber } from "@/lib/money";
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
import { AppointmentStatusSelect } from "@/components/admin/appointment-status-select";

type Filter = "upcoming" | "past" | "all";

const TABS: { value: Filter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterParam } = await searchParams;
  const filter: Filter =
    filterParam === "past" || filterParam === "all" ? filterParam : "upcoming";

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const where: Prisma.AppointmentWhereInput =
    filter === "upcoming"
      ? { start: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] } }
      : filter === "past"
        ? { start: { lt: now } }
        : {};

  const [
    appointments,
    upcomingCount,
    totalCount,
    todayCount,
    revenueWeek,
    pendingCount,
  ] = await Promise.all([
    db.appointment.findMany({
      where,
      orderBy: { start: filter === "past" ? "desc" : "asc" },
      take: 200,
      include: {
        service: { select: { name: true, durationMin: true } },
        staff: { select: { name: true } },
      },
    }),
    db.appointment.count({
      where: { start: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    db.appointment.count(),
    db.appointment.count({
      where: {
        start: { gte: todayStart, lte: todayEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    db.appointment.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: "PAID", createdAt: { gte: weekStart } },
    }),
    db.appointment.count({ where: { status: "PENDING" } }),
  ]);

  const cards = [
    {
      label: "Upcoming",
      value: String(upcomingCount),
      icon: CalendarClock,
    },
    {
      label: "Today",
      value: String(todayCount),
      icon: CalendarDays,
    },
    {
      label: "Revenue this week",
      value: formatMoney(toNumber(revenueWeek._sum.amount)),
      icon: Banknote,
    },
    {
      label: "Pending confirmation",
      value: String(pendingCount),
      icon: Clock,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Appointment Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {upcomingCount} upcoming · {totalCount} total
          </p>
        </div>
        <div className="inline-flex rounded-lg border bg-card p-1">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`/admin/appointments?filter=${t.value}`}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm transition-colors",
                filter === t.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

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
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Specialist</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No {filter === "all" ? "" : filter} appointments.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((a) => (
                <ClickableRow key={a.id} href={`/admin/appointments/${a.id}`}>
                  <TableCell>
                    <span className="font-medium">
                      {format(a.start, "EEE, MMM d, yyyy")}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {format(a.start, "h:mm a")} · {a.service.durationMin} min
                    </span>
                    {isToday(a.start) && (
                      <Badge variant="gold" className="mt-1">
                        Today
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{a.service.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.staff.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="block text-foreground">{a.customerName}</span>
                    <span className="block text-xs">{a.customerEmail}</span>
                    {a.customerPhone && (
                      <span className="block text-xs">{a.customerPhone}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={a.paymentStatus === "PAID" ? "gold" : "secondary"}
                    >
                      {a.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AppointmentStatusSelect id={a.id} status={a.status} />
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
