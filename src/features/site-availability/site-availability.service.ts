import { db } from "@/lib/db";
import {
  siteAvailabilitySchema,
  SITE_AVAILABILITY_KEY,
  DEFAULT_SITE_AVAILABILITY,
  type SiteAvailability,
  type SiteMode,
} from "./site-availability.schema";

/**
 * Read the current site-availability config, falling back to defaults (both
 * modes off) when the row is missing or malformed. Reads live on every request
 * — the storefront layout is `force-dynamic`, so no cache to invalidate.
 */
export async function getSiteAvailability(): Promise<SiteAvailability> {
  const row = await db.setting.findUnique({
    where: { key: SITE_AVAILABILITY_KEY },
  });
  const parsed = siteAvailabilitySchema.safeParse(row?.value);
  return parsed.success ? parsed.data : DEFAULT_SITE_AVAILABILITY;
}

export type ActiveSiteMode = {
  mode: SiteMode;
  kind: "maintenance" | "comingSoon";
};

/**
 * The mode a guest should see, or null when the storefront is live.
 * Maintenance takes precedence when both toggles are on.
 */
export function activeSiteMode(
  availability: SiteAvailability,
): ActiveSiteMode | null {
  if (availability.maintenance.enabled) {
    return { mode: availability.maintenance, kind: "maintenance" };
  }
  if (availability.comingSoon.enabled) {
    return { mode: availability.comingSoon, kind: "comingSoon" };
  }
  return null;
}
