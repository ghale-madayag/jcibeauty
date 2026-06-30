"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

/**
 * "Discover the Secrets of Glowing Skin" video feature — a poster image with a
 * play button that swaps to the playing video inline.
 *
 * Swap the media for your own:
 *  - Local file: drop an .mp4 in /public/videos and set VIDEO_SRC
 *    (e.g. "/videos/glowing-skin.mp4"). Takes priority when set.
 *  - YouTube: set YOUTUBE_ID to the id in the video URL
 *    (youtube.com/watch?v=THIS_PART).
 * The poster can be any image in /public/images.
 */
const POSTER = "/images/video_block_bg.jpeg";
const VIDEO_SRC = "/images/Skincare_journey_video_marketing_202606301007.mp4";
const YOUTUBE_ID = "aqz-KE-bpKQ"; // placeholder — replace with your own

// Vertical drift as a fraction of the frame height (0.4 = up to ±20% travel).
const PARALLAX_STRENGTH = 0.4;

export function VideoSection() {
  const [playing, setPlaying] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const posterLayerRef = React.useRef<HTMLSpanElement | null>(null);

  // Scroll-driven parallax on the poster (only while it's showing).
  React.useEffect(() => {
    if (playing) return;
    const frame = frameRef.current;
    const layer = posterLayerRef.current;
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
  }, [playing]);

  return (
    <section className="container-px mx-auto max-w-5xl py-20">
      <h2 className="text-center font-serif text-3xl font-semibold uppercase tracking-wide text-foreground md:text-4xl">
        Discover the Secrets of Glowing Skin
      </h2>

      <div className="mt-10 overflow-hidden rounded-3xl bg-secondary shadow-sm">
        <div className="relative aspect-video" ref={frameRef}>
          {playing ? (
            VIDEO_SRC ? (
              <video
                src={VIDEO_SRC}
                poster={POSTER}
                controls
                autoPlay
                className="absolute inset-0 h-full w-full bg-black object-cover"
              />
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
                title="Discover the Secrets of Glowing Skin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            )
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play video"
              className="group absolute inset-0 h-full w-full"
            >
              {/* Parallax poster layer — oversized vertically so the scroll
                  drift never reveals the top/bottom edges */}
              <span
                className="absolute inset-x-0 -top-[25%] block h-[150%] will-change-transform"
                ref={posterLayerRef}
              >
                <Image
                  src={POSTER}
                  alt="Discover the secrets of glowing skin"
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              </span>
              <span className="absolute inset-0 flex items-center justify-center bg-black/5 transition-colors group-hover:bg-black/10">
                <span className="flex size-20 items-center justify-center rounded-full border-2 border-white/90 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                  <Play className="size-7 translate-x-0.5 fill-white text-white" />
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
