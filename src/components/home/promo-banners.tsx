import Link from "next/link";
import { Sparkle, Tag, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const TREATMENTS = [
  "Advalight Dual Laser",
  "Aerolase Neo Elite",
  "Sygmalift (lower face)",
  "Tornado Facial (Dermaclear)",
  "Botoskin Rotational HIFU",
];

const RATES = [
  "Premium Fillers starts at ₱12,000",
  "Targeted Botox starts ₱399 per unit",
  "Laser Warts Removal starts at ₱2,000 per area",
];

export function PromoBanners() {
  return (
    <section className="container-px mx-auto max-w-7xl py-20">
      <div className="grid gap-6 lg:grid-cols-2 lg:grid-rows-2">
        {/* Buy 1 Get 1 — large left card */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-accent p-8 text-center sm:p-10 lg:row-span-2">
          <Sparkle className="pointer-events-none absolute right-6 top-8 size-5 fill-plum text-plum" />
          <Sparkle className="pointer-events-none absolute bottom-10 left-7 size-6 fill-plum text-plum" />

          <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-luxe text-muted-foreground">
            <span className="size-1.5 rounded-full bg-gold/60" />
            June Promo
            <span className="size-1.5 rounded-full bg-gold/60" />
          </p>
          <h3 className="mt-3 font-serif text-5xl font-bold leading-none text-gold md:text-6xl">
            Buy 1 Get 1
          </h3>

          <ul className="mx-auto mt-7 flex w-full max-w-sm flex-col gap-3">
            {TREATMENTS.map((t) => (
              <li
                key={t}
                className="rounded-full border border-gold/30 bg-white/60 px-5 py-2.5 text-sm font-medium text-foreground"
              >
                {t}
              </li>
            ))}
          </ul>

          <Button
            asChild
            variant="gold"
            size="lg"
            className="mx-auto mt-8 w-fit uppercase tracking-luxe"
          >
            <Link href="/book">Book Now</Link>
          </Button>
        </div>

        {/* Featured rates — top right */}
        <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl bg-accent p-8 lg:min-h-[234px]">
          <div>
            <span className="text-xs font-medium uppercase tracking-luxe text-muted-foreground">
              Featured Rates
            </span>
            <ul className="mt-3 space-y-1.5">
              {RATES.map((r) => (
                <li key={r} className="text-sm text-foreground">
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-white/70 text-gold shadow-sm">
            <Tag className="size-10" />
          </span>
        </div>

        {/* Valid until — bottom right */}
        <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl bg-accent p-8 lg:min-h-[234px]">
          <div>
            <p className="text-xs font-medium uppercase tracking-luxe text-muted-foreground">
              Limited Time Offer
            </p>
            <p className="mt-2 font-serif text-3xl font-bold leading-tight text-gold md:text-4xl">
              Valid until June 30, 2026
            </p>
            <Link
              href="/book"
              className="mt-4 inline-block text-sm font-medium uppercase tracking-luxe text-gold hover:underline"
            >
              Book your slot →
            </Link>
          </div>
          <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-white/70 text-gold shadow-sm">
            <CalendarCheck className="size-10" />
          </span>
        </div>
      </div>
    </section>
  );
}
