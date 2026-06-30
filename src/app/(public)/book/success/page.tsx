import Link from "next/link";
import { format } from "date-fns";
import { CalendarCheck, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import { isStripeConfigured } from "@/lib/stripe";
import { appointmentService } from "@/features/appointments/appointment.service";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ appointment?: string; session_id?: string }>;
}) {
  const { appointment: id, session_id } = await searchParams;
  // Guest booking — gate details on the unguessable Stripe session id (open
  // lookup only in the simulated dev checkout when Stripe is off).
  const appointment = id
    ? await appointmentService.getReceipt(id, session_id, !isStripeConfigured)
    : null;

  return (
    <div className="container-px mx-auto max-w-xl py-24 text-center">
      <CalendarCheck className="mx-auto size-16 text-gold" />
      <h1 className="mt-6 font-serif text-4xl">You&apos;re booked!</h1>
      <p className="mt-3 text-muted-foreground">
        Your appointment is confirmed. A confirmation has been sent to your
        email.
      </p>

      {appointment && (
        <div className="mt-10 rounded-xl border bg-card p-6 text-left">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">{appointment.service.name}</h2>
            <Badge variant={appointment.paymentStatus === "PAID" ? "gold" : "secondary"}>
              {appointment.paymentStatus === "PAID" ? "Paid" : "Pending"}
            </Badge>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarCheck className="size-4" />
              {format(appointment.start, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4" />
              {format(appointment.start, "h:mm a")} ·{" "}
              {appointment.service.durationMin} min
            </p>
            <p className="flex items-center gap-2">
              <User className="size-4" />
              {appointment.staff.name}
            </p>
          </div>
          {appointment.amount != null && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-between font-medium">
                <span>Total paid</span>
                <span>{formatMoney(appointment.amount.toString())}</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <Button asChild variant="gold">
          <Link href="/shop">Shop products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
