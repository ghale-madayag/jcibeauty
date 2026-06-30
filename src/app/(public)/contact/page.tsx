import type { Metadata } from "next";
import { ArrowDown, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Newsletter } from "@/components/home/newsletter";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { treatmentService } from "@/features/services/service.service";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact" };

const LOCATION = "MacArthur Highway, San Roque, Tarlac City, 2300 Philippines";
const MAP_SRC =
  "https://maps.google.com/maps?q=MacArthur%20Highway%20San%20Roque%20Tarlac%20City&z=14&output=embed";

export default async function ContactPage() {
  const services = await treatmentService.list();

  const info = [
    { icon: Mail, label: "Email", value: SITE.email },
    { icon: Phone, label: "Phone", value: SITE.phone },
    { icon: MapPin, label: "Location", value: LOCATION },
    { icon: Clock, label: "Hours", value: SITE.hours },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="container-px mx-auto max-w-3xl py-20 text-center">
        <span className="text-xs font-medium uppercase tracking-luxe text-gold">
          Private Consultations
        </span>
        <h1 className="mt-3 font-serif text-5xl font-bold leading-[1.05] md:text-7xl">
          Begin Your
          <br />
          <span className="text-gold">Transformation</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Experience clinical excellence in a sanctuary of serenity. Our
          specialists are ready to craft your personalized skincare journey.
        </p>
        <a
          href="#inquiry"
          className="mt-8 inline-flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-luxe text-gold"
        >
          Send an Inquiry
          <ArrowDown className="size-4 animate-bounce" />
        </a>
      </section>

      {/* Inquiry + details */}
      <section id="inquiry" className="container-px mx-auto max-w-6xl pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <InquiryForm
            services={services.map((s) => ({ id: s.id, name: s.name }))}
          />

          <div className="space-y-6">
            <iframe
              title={`Map to ${SITE.name}`}
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-64 w-full rounded-2xl border"
            />

            <div className="space-y-5">
              {info.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-luxe text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-0.5 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
