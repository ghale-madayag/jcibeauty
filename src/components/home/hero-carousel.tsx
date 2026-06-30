"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/features/cms/cms.service";

// Vertical drift as a fraction of the hero height (0.45 = up to ~±22% travel).
const PARALLAX_STRENGTH = 0.45;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const parallaxNodes = React.useRef<(HTMLDivElement | null)[]>([]);

  const scrollTo = React.useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);

    const id = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => {
      clearInterval(id);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Scroll-driven parallax: drift the image layer vertically as the hero moves
  // through the viewport. Applied to every slide so the active one is in sync.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the hero's top enters from the bottom, 1 as it exits the top.
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const y = (0.5 - clamped) * rect.height * PARALLAX_STRENGTH;
      for (const node of parallaxNodes.current) {
        if (node) node.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (slides.length === 0) return null;

  return (
    <section className="container-px mx-auto max-w-7xl pt-6">
      {/* Boxed (contained) slider with rounded corners — not full-bleed. */}
      <div className="relative" ref={containerRef}>
        <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, i) => (
              <div key={i} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative h-[56vh] min-h-[400px] w-full overflow-hidden lg:h-[60vh] lg:max-h-[640px]">
                  {/* Parallax image layer — oversized vertically so the scroll
                      drift never reveals the top/bottom edges */}
                  <div
                    className="absolute inset-x-0 -top-[25%] h-[150%] will-change-transform"
                    ref={(el) => {
                      parallaxNodes.current[i] = el;
                    }}
                  >
                    {/* Mobile-optimized variant (below md) */}
                    <Image
                      src={slide.mobileImage ?? slide.image}
                      alt={slide.title}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="object-cover md:hidden"
                    />
                    {/* Tablet-optimized variant (md up to lg) */}
                    <Image
                      src={slide.tabletImage ?? slide.image}
                      alt={slide.title}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="hidden object-cover md:block lg:hidden"
                    />
                    {/* Desktop variant (lg and up) */}
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="hidden object-cover lg:block"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
                  <div className="absolute inset-0 flex items-center px-8 sm:px-12 lg:px-16">
                    <div className="max-w-xl text-white animate-fade-up">
                      <span className="text-sm font-medium uppercase tracking-luxe text-white/90">
                        {slide.eyebrow}
                      </span>
                      <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-6xl">
                        {slide.title}
                      </h1>
                      <p className="mt-4 max-w-md text-base text-white/85 md:text-lg">
                        {slide.subtitle}
                      </p>
                      <Button
                        asChild
                        variant="gold"
                        size="lg"
                        className="mt-8 tracking-luxe uppercase"
                      >
                        <Link href={slide.href}>{slide.cta}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/40 md:block"
          aria-label="Previous"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/40 md:block"
          aria-label="Next"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === selected ? "w-8 bg-gold" : "w-4 bg-white/60",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
