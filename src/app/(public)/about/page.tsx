import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Sparkles, ShieldCheck, Heart, Quote } from "lucide-react";
import { Newsletter } from "@/components/home/newsletter";
import { treatmentService } from "@/features/services/service.service";

export const metadata: Metadata = { title: "About" };

const principles = [
  {
    icon: Sparkles,
    title: "Innovation",
    body: "Continuously investing in FDA-approved global technologies and next-generation protocols to deliver superior clinical outcomes.",
  },
  {
    icon: ShieldCheck,
    title: "Clinical Excellence",
    body: "A rigorous approach to medical safety and precision, ensuring every treatment is administered with the highest professional standards.",
  },
  {
    icon: Heart,
    title: "Empowerment",
    body: "We believe aesthetic care is a journey toward self-confidence, providing a sanctuary where clients feel truly seen and understood.",
  },
];

export default async function AboutPage() {
  const services = await treatmentService.list();
  const panels = services.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="container-px mx-auto max-w-4xl py-20 text-center">
        <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">
          Your Transformation,
          <br />
          <span className="text-gold">Our Legacy</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          For over two decades, JCI Skin Clinic has pioneered the intersection of
          clinical precision and aesthetic artistry, creating a sanctuary for
          those who seek uncompromising results.
        </p>
        <a
          href="#story"
          className="mt-8 inline-flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-luxe text-gold"
        >
          Discover Our Story
          <ArrowDown className="size-4 animate-bounce" />
        </a>
      </section>

      {/* Founder story */}
      <section id="story" className="container-px mx-auto max-w-6xl py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/images/dr.webp"
              alt="Dr. Joanne Capulong-Indab"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold md:text-4xl">
              From Two Beds to{" "}
              <span className="text-gold">World-Class Care</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Founded by Dr. Joanne Capulong-Indab, JCI Skin Clinic began as a
              modest two-bed facility with a singular vision: to bring world-class
              dermatological innovation to the heart of Tarlac City.
            </p>
            <blockquote className="mt-6 border-l-2 border-gold pl-5 font-serif text-xl italic leading-relaxed text-foreground">
              “We don’t just treat skin; we restore the confidence that allows you
              to show up as your best self.”
            </blockquote>
            <div className="mt-6">
              <p className="font-medium">— Dr. Joanne Capulong-Indab</p>
              <p className="text-xs uppercase tracking-luxe text-muted-foreground">
                Founder &amp; Chief Dermatologist
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-accent py-20">
        <div className="container-px mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-luxe text-gold">
              Our Guiding Principles
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
              The JCI Philosophy
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border bg-card p-8 text-center"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <p.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services showcase */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container-px mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-luxe text-gold">
              Our Services
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
              Elevate Your Beauty Journey
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">
              Discover our curated range of luxury treatments — each designed to
              transform, restore, and reveal your most radiant self. Book your
              complimentary consultation today.
            </p>
          </div>

          {/* Expanding panels: hover a panel to reveal its details (desktop). */}
          <div className="mt-12 grid grid-cols-2 gap-3 md:flex md:h-[460px]">
            {panels.map((s) => (
              <Link
                key={s.id}
                href="/book"
                className="group/panel relative h-56 overflow-hidden rounded-2xl transition-all duration-500 md:h-auto md:flex-1 md:hover:flex-[3]"
              >
                {s.image && (
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h3 className="font-serif text-xl font-bold text-white">
                    {s.name}
                  </h3>
                  {s.description && (
                    <p className="mt-2 max-w-xs text-sm text-white/80 transition-opacity duration-300 md:opacity-0 md:group-hover/panel:opacity-100">
                      {s.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex w-fit items-center rounded-md bg-gold px-5 py-2.5 text-xs font-medium uppercase tracking-luxe text-gold-foreground transition-opacity duration-300 md:opacity-0 md:group-hover/panel:opacity-100">
                    Book Now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-px mx-auto max-w-6xl py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <h2 className="font-serif text-4xl font-bold uppercase leading-[0.95] md:text-6xl">
            What
            <br />
            Our
            <br />
            Clients
            <br />
            Say
          </h2>
          <figure>
            <Quote className="size-10 fill-gold text-gold" />
            <blockquote className="mt-4 font-serif text-2xl italic leading-relaxed">
              “This serum completely transformed my skin. I wake up glowing every
              morning — I’m never going back!”
            </blockquote>
            <figcaption className="mt-6">
              <span className="block font-medium uppercase tracking-luxe">
                Sarah M.
              </span>
              <span className="block text-xs text-muted-foreground">
                Verified Buyer
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
