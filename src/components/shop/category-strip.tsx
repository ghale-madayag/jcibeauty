"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import type { CategoryListItem } from "@/features/categories/category.service";

/** A single category tile (pale-pink square + label). */
function Tile({ c, active }: { c: CategoryListItem; active?: string }) {
  const isActive = active === c.slug;
  return (
    <Link
      href={isActive ? "/shop" : `/shop?category=${c.slug}`}
      aria-current={isActive ? "true" : undefined}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <span
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-2xl bg-accent ring-2 ring-transparent transition-all duration-300 group-hover:ring-gold/40",
          isActive && "ring-gold",
        )}
      >
        {c.image ? (
          <Image
            src={c.image}
            alt={c.name}
            fill
            sizes="(max-width: 1024px) 33vw, 14vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
            {c.name}
          </span>
        )}
      </span>
      <span
        className={cn(
          "text-xs font-medium transition-colors group-hover:text-gold sm:text-sm",
          isActive && "text-gold",
        )}
      >
        {c.name}
      </span>
    </Link>
  );
}

/**
 * Highlighted categories. On mobile/tablet this is an auto-advancing, swipeable
 * carousel; on desktop (lg+) it's a static 7-up grid.
 */
export function CategoryStrip({
  categories,
  active,
}: {
  categories: CategoryListItem[];
  active?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  // Auto-slide (right→left), pausing while the user is dragging.
  React.useEffect(() => {
    if (!emblaApi) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // honor reduced-motion — still swipeable, just no autoplay
    }

    let timer: ReturnType<typeof setInterval> | null = null;
    const play = () => {
      stop();
      timer = setInterval(() => emblaApi.scrollNext(), 2800);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    play();
    emblaApi.on("pointerDown", stop);
    emblaApi.on("pointerUp", play);
    return () => {
      stop();
      emblaApi.off("pointerDown", stop);
      emblaApi.off("pointerUp", play);
    };
  }, [emblaApi]);

  if (categories.length === 0) return null;

  return (
    <>
      {/* Mobile + tablet: auto-sliding, swipeable carousel */}
      <div className="overflow-hidden lg:hidden" ref={emblaRef}>
        {/* Spacing lives in each slide's padding (not `gap`) so it stays
            correct across the loop boundary. The -ml-4 cancels the first
            slide's padding so the track aligns flush left. */}
        <div className="-ml-4 flex">
          {categories.map((c) => (
            <div
              key={c.id}
              className="min-w-0 flex-[0_0_33%] pl-4 sm:flex-[0_0_25%] md:flex-[0_0_20%]"
            >
              <Tile c={c} active={active} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: static grid */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-7">
        {categories.map((c) => (
          <Tile key={c.id} c={c} active={active} />
        ))}
      </div>
    </>
  );
}
