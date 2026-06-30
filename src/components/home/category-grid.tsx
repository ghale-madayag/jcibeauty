"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryListItem } from "@/features/categories/category.service";

// Vertical drift as a fraction of each card's height (0.4 = up to ±20% travel).
const PARALLAX_STRENGTH = 0.4;
// Scroll phase offset per card so they move in sequence (first card leads).
const PARALLAX_STAGGER = 0.07;

export function CategoryGrid({
  categories,
}: {
  categories: CategoryListItem[];
}) {
  const layerRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Scroll-driven parallax: drift each card's image as the card moves through
  // the viewport. Each card is measured independently (handles the mobile stack).
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      layerRefs.current.forEach((node, idx) => {
        const card = node?.parentElement;
        if (!node || !card) return;
        const rect = card.getBoundingClientRect();
        const progress = (vh - rect.top) / (vh + rect.height);
        // Later cards lag behind, so the first card moves first (sequential).
        const staggered = progress - idx * PARALLAX_STAGGER;
        const clamped = Math.max(0, Math.min(1, staggered));
        const y = (0.5 - clamped) * rect.height * PARALLAX_STRENGTH;
        node.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      });
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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c, i) => (
        <Link
          key={c.id}
          href={`/shop?category=${c.slug}`}
          className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-secondary transition-shadow hover:shadow-xl"
        >
          {/* Parallax image layer — oversized vertically so the drift never
              reveals the top/bottom edges. Hover-scale stays on the image. */}
          <div
            className="absolute inset-x-0 -top-[25%] h-[150%] will-change-transform"
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
          >
            {c.image && (
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>

          {/* Light scrim so the dark text stays legible over the image top */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 via-white/30 to-transparent" />

          {/* Overlay: heading always; description <-> button swap on hover */}
          <div className="absolute inset-x-0 top-0 px-6 pt-9 text-center">
            <h3 className="font-serif text-2xl font-bold leading-tight text-[#303030] md:text-3xl">
              {c.name}
            </h3>

            <div className="relative mt-3 min-h-[3.5rem]">
              {/* Description — visible by default, fades out on hover */}
              <p className="mx-auto max-w-xs text-sm text-[#303030] transition-opacity duration-300 group-hover:opacity-0">
                {c.description}
              </p>
              {/* Shop Now — hidden until hover, replaces the description */}
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-xs font-medium uppercase tracking-luxe text-gold-foreground shadow-md">
                  Shop Now
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
