"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { addDays, format } from "date-fns";
import { Check, Clock, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { BOOKING_MIN_ADVANCE_DAYS } from "@/lib/constants";
import { getSlotsAction } from "@/features/appointments/appointment.actions";
import { createBookingCheckoutAction } from "@/features/appointments/appointment.checkout.actions";

interface Service {
  id: string;
  name: string;
  slug: string;
  durationMin: number;
  price: number;
}
interface Staff {
  id: string;
  name: string;
  title: string | null;
  serviceIds: string[];
}

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Service", "Specialist", "Date & Time", "Payment"];

export function BookingWizard({
  services,
  staff,
  initialServiceSlug,
}: {
  services: Service[];
  staff: Staff[];
  initialServiceSlug?: string;
}) {
  const { data: session } = useSession();
  const [step, setStep] = React.useState<Step>(0);
  const [serviceId, setServiceId] = React.useState<string | null>(
    services.find((s) => s.slug === initialServiceSlug)?.id ?? null,
  );
  const [staffId, setStaffId] = React.useState<string | null>(null);
  const [date, setDate] = React.useState<string>(
    format(addDays(new Date(), BOOKING_MIN_ADVANCE_DAYS), "yyyy-MM-dd"),
  );
  const [slots, setSlots] = React.useState<string[]>([]);
  const [slot, setSlot] = React.useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const eligibleStaff = staff.filter((s) =>
    serviceId ? s.serviceIds.includes(serviceId) : false,
  );

  const [details, setDetails] = React.useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });

  React.useEffect(() => {
    if (session?.user) {
      setDetails((d) => ({
        ...d,
        customerName: d.customerName || (session.user.name ?? ""),
        customerEmail: d.customerEmail || (session.user.email ?? ""),
      }));
    }
  }, [session]);

  const dates = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) =>
        addDays(new Date(), i + BOOKING_MIN_ADVANCE_DAYS),
      ),
    [],
  );

  // Load slots whenever staff/date/service is set on the date step.
  React.useEffect(() => {
    if (step !== 2 || !serviceId || !staffId) return;
    let active = true;
    setLoadingSlots(true);
    setSlot(null);
    getSlotsAction({ serviceId, staffId, date }).then((res) => {
      if (!active) return;
      setSlots(res.slots);
      setLoadingSlots(false);
    });
    return () => {
      active = false;
    };
  }, [step, serviceId, staffId, date]);

  async function submit() {
    if (!serviceId || !staffId || !slot) return;
    setSubmitting(true);
    setError(null);
    const res = await createBookingCheckoutAction({
      serviceId,
      staffId,
      start: slot,
      ...details,
    });
    if (res.ok && res.url) {
      window.location.href = res.url;
    } else {
      setSubmitting(false);
      setError(res.error ?? "Booking failed.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <ol className="mb-10 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border text-sm font-medium",
                  i < step && "border-gold bg-gold text-gold-foreground",
                  i === step && "border-gold text-gold",
                  i > step && "border-border text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  i < step ? "bg-gold" : "bg-border",
                )}
              />
            )}
          </li>
        ))}
      </ol>

      {/* Step 0: Service */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl">Choose a treatment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "flex flex-col rounded-xl border p-4 text-left transition",
                  serviceId === s.id
                    ? "border-gold ring-1 ring-gold"
                    : "hover:border-foreground/30",
                )}
              >
                <span className="font-medium">{s.name}</span>
                <span className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-3.5" /> {s.durationMin} min ·{" "}
                  {formatMoney(s.price)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              variant="gold"
              disabled={!serviceId}
              onClick={() => setStep(1)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Staff */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl">Choose your specialist</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {eligibleStaff.map((s) => (
              <button
                key={s.id}
                onClick={() => setStaffId(s.id)}
                className={cn(
                  "flex flex-col rounded-xl border p-4 text-left transition",
                  staffId === s.id
                    ? "border-gold ring-1 ring-gold"
                    : "hover:border-foreground/30",
                )}
              >
                <span className="font-medium">{s.name}</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {s.title}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              variant="gold"
              disabled={!staffId}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Date & time */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="font-serif text-2xl">Pick a date & time</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((d) => {
              const value = format(d, "yyyy-MM-dd");
              return (
                <button
                  key={value}
                  onClick={() => setDate(value)}
                  className={cn(
                    "flex min-w-16 flex-col items-center rounded-lg border px-3 py-2 transition",
                    date === value
                      ? "border-gold bg-gold/10 text-foreground"
                      : "hover:border-foreground/30",
                  )}
                >
                  <span className="text-xs text-muted-foreground">
                    {format(d, "EEE")}
                  </span>
                  <span className="text-lg font-medium">{format(d, "d")}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(d, "MMM")}
                  </span>
                </button>
              );
            })}
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : slots.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No available times for this date. Try another day.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={cn(
                    "rounded-md border py-2 text-sm transition",
                    slot === s
                      ? "border-gold bg-gold text-gold-foreground"
                      : "hover:border-foreground/30",
                  )}
                >
                  {format(new Date(s), "h:mm a")}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="gold" disabled={!slot} onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Full name</Label>
              <Input
                value={details.customerName}
                onChange={(e) =>
                  setDetails({ ...details, customerName: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input
                type="email"
                value={details.customerEmail}
                onChange={(e) =>
                  setDetails({ ...details, customerEmail: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Phone</Label>
              <Input
                value={details.customerPhone}
                onChange={(e) =>
                  setDetails({ ...details, customerPhone: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Notes (optional)</Label>
              <Textarea
                value={details.notes}
                onChange={(e) =>
                  setDetails({ ...details, notes: e.target.value })
                }
                placeholder="Anything we should know?"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-secondary/40 p-4">
            <div className="flex items-start justify-between text-sm">
              <div>
                <p className="font-medium">{service?.name}</p>
                <p className="mt-1 text-muted-foreground">
                  {slot && format(new Date(slot), "EEEE, MMM d 'at' h:mm a")} ·{" "}
                  {service?.durationMin} min
                </p>
              </div>
              <span className="font-medium">
                {service && formatMoney(service.price)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-base font-medium">
              <span>Total due</span>
              <span>{service && formatMoney(service.price)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="gold"
              disabled={
                submitting || !details.customerName || !details.customerEmail
              }
              onClick={submit}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
