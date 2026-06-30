"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeAction } from "@/features/cms/newsletter.actions";

// Vertical drift as a fraction of the frame height (0.4 = up to ±20% travel).
const PARALLAX_STRENGTH = 0.4;

export function Newsletter() {
  const [pending, setPending] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const imageLayerRef = React.useRef<HTMLDivElement | null>(null);

  async function action(formData: FormData) {
    setPending(true);
    const res = await subscribeAction(formData);
    setPending(false);
    if (res.ok) toast.success("Welcome to the JCI Beauty Club!");
    else toast.error(res.error ?? "Something went wrong.");
  }

  // Scroll-driven parallax on the background image.
  React.useEffect(() => {
    const frame = frameRef.current;
    const layer = imageLayerRef.current;
    if (!frame || !layer) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = frame.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const y = (0.5 - clamped) * rect.height * PARALLAX_STRENGTH;
      layer.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
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
    <section className="bg-background py-16">
      <div className="container-px mx-auto max-w-7xl">
        <div
          className="relative h-[400px] overflow-hidden rounded-3xl"
          ref={frameRef}
        >
          {/* Background image (brushes on the left, plain pink on the right).
              Oversized layer so the scroll parallax never reveals the edges. */}
          <div
            className="absolute inset-x-0 -top-[25%] h-[150%] will-change-transform"
            ref={imageLayerRef}
          >
            <Image
              src="/images/newsletter_1.jpeg"
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </div>

          {/* Content sits on the right half over the plain-pink area */}
          <div className="relative grid h-full md:grid-cols-2">
            <div className="hidden md:block" />
            <div className="flex flex-col justify-center p-8 md:pr-12 lg:pr-16">
              <h2 className="font-serif text-3xl font-bold text-[#303030] md:text-4xl">
                Sign up for our newsletter
              </h2>
              <p className="mt-3 max-w-md text-sm text-[#303030]/80">
                to receive the latest beauty tips, exclusive offers, and updates.
              </p>
              <form
                action={action}
                className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email address …"
                  className="h-12 border-transparent bg-background text-foreground shadow-sm"
                />
                <Button
                  type="submit"
                  variant="plum"
                  size="lg"
                  className="h-12 uppercase tracking-luxe"
                  disabled={pending}
                >
                  {pending ? "Joining…" : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
