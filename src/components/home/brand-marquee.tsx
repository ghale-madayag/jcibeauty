const CATEGORIES = ["Skincare", "Serum", "Moisturizer"];

// Repeat to fill the viewport width; the track then renders two identical halves
// and scrolls by -50% for a seamless loop.
const HALF = Array.from({ length: 4 }).flatMap(() => CATEGORIES);

/**
 * Continuously scrolling brand-name marquee. The track holds two identical
 * copies of the list and animates by -50%, so the loop is seamless. Each item
 * carries its own right margin (not a flex gap) so the two halves line up
 * exactly. Pauses on hover; respects reduced-motion.
 */
export function BrandMarquee() {
  return (
    <section className="overflow-hidden border-y bg-background py-8">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...HALF, ...HALF].map((label, i) => (
          <span
            key={i}
            aria-hidden={i >= HALF.length}
            className="mr-14 select-none whitespace-nowrap font-serif text-3xl font-bold uppercase tracking-wide text-gold/25 md:mr-20 md:text-5xl"
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
