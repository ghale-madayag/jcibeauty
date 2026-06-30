import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Mail,
  Phone,
  StickyNote,
} from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import { AppointmentStatusSelect } from "@/components/admin/appointment-status-select";

export default async function AdminAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await db.appointment.findUnique({
    where: { id },
    include: { service: true, staff: true },
  });
  if (!appointment) notFound();

  return (
    <div>
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to appointments
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">{appointment.service.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Booked {appointment.createdAt.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={appointment.paymentStatus === "PAID" ? "gold" : "secondary"}
          >
            {appointment.paymentStatus}
          </Badge>
          <Badge variant="outline">{appointment.status}</Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Appointment details */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-serif text-lg">Appointment</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              {format(appointment.start, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              {format(appointment.start, "h:mm a")} –{" "}
              {format(appointment.end, "h:mm a")} ·{" "}
              {appointment.service.durationMin} min
            </p>
            <p className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              {appointment.staff.name}
            </p>
          </div>

          {appointment.notes && (
            <>
              <Separator className="my-5" />
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <StickyNote className="size-4 text-gold" /> Notes
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {appointment.notes}
              </p>
            </>
          )}

          <Separator className="my-5" />

          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">
                {appointment.amount != null
                  ? formatMoney(appointment.amount)
                  : "No charge"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd>
                <Badge
                  variant={
                    appointment.paymentStatus === "PAID" ? "gold" : "secondary"
                  }
                >
                  {appointment.paymentStatus}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>

        {/* Customer + status */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-serif text-lg">Customer</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">{appointment.customerName}</p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <a
                  href={`mailto:${appointment.customerEmail}`}
                  className="hover:text-gold hover:underline"
                >
                  {appointment.customerEmail}
                </a>
              </p>
              {appointment.customerPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {appointment.customerPhone}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-serif text-lg">Update status</h2>
            <div className="mt-4">
              <AppointmentStatusSelect
                id={appointment.id}
                status={appointment.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
