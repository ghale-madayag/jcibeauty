import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, Stethoscope, Sparkles, Heart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/page-hero";
import { ServicesSection } from "@/components/home/services-section";
import { formatMoney } from "@/lib/money";
import { treatmentService } from "@/features/services/service.service";

export const metadata: Metadata = {
  title: "Services",
  description: "Clinical, results-driven beauty treatments by our medical team.",
};

const VALUES = [
  {
    icon: Stethoscope,
    title: "Medical Expertise",
    text: "Treatments designed and supervised by board-certified physicians.",
  },
  {
    icon: Sparkles,
    title: "Advanced Technology",
    text: "FDA-approved, next-generation devices for safe, visible results.",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    text: "Every plan is tailored to your unique skin goals and concerns.",
  },
  {
    icon: Leaf,
    title: "Clean & Cruelty-Free",
    text: "Skin-loving, dermatologist-tested formulations you can trust.",
  },
];

export default async function ServicesPage() {
  const services = await treatmentService.list();
  const signature = services.slice(0, 3);
  const rest = services.slice(3);

  return (
    <div>
      <PageHero
        eyebrow="Professional Care"
        title="Our Signature"
        accent="Treatments"
        subtitle="Where medical precision meets radiant self-care. Each treatment is tailored to your unique skin goals."
        anchor="#treatments"
        anchorLabel="Explore Services"
      />

      {/* Most loved / BEST treatments */}
      <section id="treatments" className="container-px mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-xs font-medium uppercase tracking-luxe text-gold">
            Most Loved
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
            Signature Treatments
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {signature.map((s) => (
            <div
              key={s.id}
              className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/10"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                {s.image && (
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <Badge variant="gold" className="absolute left-3 top-3 shadow-sm">
                  Best
                </Badge>
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h3 className="font-serif text-xl font-bold leading-snug">
                  {s.name}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {s.description}
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {s.durationMin} min
                  </span>
                  <span className="font-semibold text-gold">
                    {formatMoney(s.price)}
                  </span>
                </div>
                <Button
                  asChild
                  variant="gold"
                  className="mt-3 uppercase tracking-luxe"
                >
                  <Link href={`/book?service=${s.slug}`}>Book Now</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Remaining treatments */}
      {rest.length > 0 && (
        <section className="container-px mx-auto max-w-7xl py-20">
          <div className="mb-12 text-center">
            <span className="text-xs font-medium uppercase tracking-luxe text-gold">
              The Full Menu
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
              Explore More Treatments
            </h2>
          </div>
          <ServicesSection services={rest} />
        </section>
      )}

      {/* Why choose us */}
      <section className="bg-accent py-20">
        <div className="container-px mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-luxe text-gold">
              Why JCI Beauty
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
              Care You Can Trust
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border bg-card p-7 text-center"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <v.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">
            Ready to Glow?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/70">
            Book your complimentary consultation today and let our specialists
            craft a plan made for you.
          </p>
          <Button asChild variant="gold" size="lg" className="mt-8 uppercase tracking-luxe">
            <Link href="/book">Book an Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
