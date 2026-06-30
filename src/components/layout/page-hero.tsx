import { ArrowDown } from "lucide-react";

/**
 * Centered page hero — pink eyebrow, bold two-line heading (second line in the
 * brand pink), subtitle, and an optional scroll-down anchor.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  subtitle,
  anchor,
  anchorLabel,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  subtitle?: string;
  anchor?: string;
  anchorLabel?: string;
}) {
  return (
    <section className="container-px mx-auto max-w-3xl py-20 text-center">
      <span className="text-xs font-medium uppercase tracking-luxe text-gold">
        {eyebrow}
      </span>
      <h1 className="mt-3 font-serif text-5xl font-bold leading-[1.05] md:text-7xl">
        {title}
        <br />
        <span className="text-gold">{accent}</span>
      </h1>
      {subtitle && (
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">{subtitle}</p>
      )}
      {anchor && anchorLabel && (
        <a
          href={anchor}
          className="mt-8 inline-flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-luxe text-gold"
        >
          {anchorLabel}
          <ArrowDown className="size-4 animate-bounce" />
        </a>
      )}
    </section>
  );
}
