import type { Metadata } from "next";
import { Award, CalendarCheck, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { treatmentService } from "@/features/services/service.service";
import { staffService } from "@/features/staff/staff.service";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book a clinical beauty treatment with our specialists.",
};

const STEPS = [
  {
    n: "01",
    title: "Choose Your Treatment",
    text: "Browse our curated menu of clinical, results-driven treatments.",
  },
  {
    n: "02",
    title: "Pick a Specialist & Time",
    text: "Select your preferred expert and an available slot that suits you.",
  },
  {
    n: "03",
    title: "Confirm & Glow",
    text: "Secure your booking and arrive to a sanctuary of personalized care.",
  },
];

const REASONS = [
  {
    icon: Award,
    title: "Expert Specialists",
    text: "Board-certified physicians and senior estheticians with decades of experience.",
  },
  {
    icon: CalendarCheck,
    title: "Flexible Scheduling",
    text: "Real-time availability with easy reschedule and cancellation.",
  },
  {
    icon: Sparkles,
    title: "Complimentary Consultation",
    text: "Every treatment begins with a tailored skin assessment.",
  },
];

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const [services, staff] = await Promise.all([
    treatmentService.listBookable(),
    staffService.listWithServiceIds(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="Book Appointment"
        title="Reserve Your"
        accent="Treatment"
        subtitle="Select a treatment, choose your specialist, and pick a time that works for you — in just a few steps."
        anchor="#booking"
        anchorLabel="Start Booking"
      />

      {/* How it works */}
      <section className="container-px mx-auto max-w-6xl pb-8">
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border bg-card p-7"
            >
              <span className="font-serif text-4xl font-bold text-gold/30">
                {s.n}
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking wizard */}
      <section id="booking" className="container-px mx-auto max-w-5xl py-12">
        {services.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No bookable services are available right now.
          </p>
        ) : (
          <BookingWizard
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
              durationMin: s.durationMin,
              price: s.price,
            }))}
            staff={staff.map((s) => ({
              id: s.id,
              name: s.name,
              title: s.title,
              serviceIds: s.serviceIds,
            }))}
            initialServiceSlug={service}
          />
        )}
      </section>

      {/* Why book with us */}
      <section className="bg-accent py-20">
        <div className="container-px mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-luxe text-gold">
              The JCI Difference
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
              Why Book With JCI Beauty
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {REASONS.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border bg-card p-8 text-center"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <r.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold">{r.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
