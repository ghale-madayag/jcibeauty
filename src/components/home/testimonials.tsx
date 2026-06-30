import { Star } from "lucide-react";

const reviews = [
  {
    name: "Camille R.",
    text: "My skin has never looked better. The Radiance Glow Serum is pure magic.",
    role: "Verified Customer",
  },
  {
    name: "Andrea M.",
    text: "The OxyGeneo facial left me glowing for weeks. Truly clinical-grade care.",
    role: "Verified Customer",
  },
  {
    name: "Patricia L.",
    text: "Premium products, beautiful packaging, and visible results. Obsessed!",
    role: "Verified Customer",
  },
  {
    name: "Joan D.",
    text: "Booking was effortless and the staff are incredibly knowledgeable.",
    role: "Verified Customer",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {reviews.map((r) => (
        <figure
          key={r.name}
          className="flex flex-col gap-4 rounded-xl border bg-card p-6"
        >
          <div className="flex gap-0.5 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-gold" />
            ))}
          </div>
          <blockquote className="flex-1 text-sm leading-relaxed text-foreground/85">
            “{r.text}”
          </blockquote>
          <figcaption>
            <span className="block text-sm font-medium">{r.name}</span>
            <span className="block text-xs text-muted-foreground">
              {r.role}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
