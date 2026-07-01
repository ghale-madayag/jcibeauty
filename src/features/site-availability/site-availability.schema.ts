import { z } from "zod";

/** Setting row key that stores the site-availability config (JSON value). */
export const SITE_AVAILABILITY_KEY = "site-availability";

const modeSchema = z.object({
  enabled: z.boolean().default(false),
  heading: z.string().trim().min(1, "Heading is required").max(120),
  message: z.string().trim().min(1, "Message is required").max(600),
});

export const siteAvailabilitySchema = z.object({
  maintenance: modeSchema,
  comingSoon: modeSchema,
});

export type SiteMode = z.infer<typeof modeSchema>;
export type SiteAvailability = z.infer<typeof siteAvailabilitySchema>;

/**
 * Used when the setting has never been saved (or is malformed). Both modes are
 * OFF by default so the gate fails open — a bad/blank config never locks
 * visitors out of the storefront.
 */
export const DEFAULT_SITE_AVAILABILITY: SiteAvailability = {
  maintenance: {
    enabled: false,
    heading: "We'll be right back",
    message:
      "Our site is undergoing scheduled maintenance and will return shortly. Thank you for your patience.",
  },
  comingSoon: {
    enabled: false,
    heading: "Something beautiful is coming",
    message:
      "Our new online experience is almost ready. Check back soon to discover JCI Beauty.",
  },
};
