import { db } from "@/lib/db";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  /** Portrait/mobile-optimized variant, shown below the md breakpoint. */
  mobileImage?: string;
  /** Tablet-optimized variant, shown from md up to (not including) lg. */
  tabletImage?: string;
};

export type Philosophy = {
  heading: string;
  body: string;
  image: string;
};

export const cmsService = {
  async hero(): Promise<HeroSlide[]> {
    const section = await db.homepageSection.findUnique({
      where: { key: "hero" },
    });
    if (!section || !section.isActive) return [];
    const content = section.content as { slides?: HeroSlide[] };
    return content.slides ?? [];
  },

  async philosophy(): Promise<Philosophy | null> {
    const section = await db.homepageSection.findUnique({
      where: { key: "philosophy" },
    });
    if (!section || !section.isActive) return null;
    return section.content as Philosophy;
  },
};
