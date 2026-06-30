"use client";

import * as React from "react";
import Lenis from "lenis";

/**
 * Site-wide smooth (inertia) scrolling via Lenis. Smooths the mouse wheel only
 * — touch keeps native scrolling so it never fights carousels on mobile. Honors
 * prefers-reduced-motion by not initializing at all.
 */
export function SmoothScroll() {
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // Auto-smooth in-page anchor links (#section) too.
      anchors: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
