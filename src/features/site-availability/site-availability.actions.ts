"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/guards";
import { db } from "@/lib/db";
import {
  siteAvailabilitySchema,
  SITE_AVAILABILITY_KEY,
  DEFAULT_SITE_AVAILABILITY,
} from "./site-availability.schema";

type ActionState = { ok: boolean; error?: string };

function field(formData: FormData, name: string, fallback: string): string {
  const value = (formData.get(name) as string | null)?.trim();
  return value && value.length > 0 ? value : fallback;
}

export async function updateSiteAvailabilityAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireSection("maintenance");

  const d = DEFAULT_SITE_AVAILABILITY;
  const raw = {
    maintenance: {
      enabled: formData.get("maintenance_enabled") === "on",
      heading: field(formData, "maintenance_heading", d.maintenance.heading),
      message: field(formData, "maintenance_message", d.maintenance.message),
    },
    comingSoon: {
      enabled: formData.get("comingSoon_enabled") === "on",
      heading: field(formData, "comingSoon_heading", d.comingSoon.heading),
      message: field(formData, "comingSoon_message", d.comingSoon.message),
    },
  };

  const parsed = siteAvailabilitySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid settings.",
    };
  }

  await db.setting.upsert({
    where: { key: SITE_AVAILABILITY_KEY },
    update: { value: parsed.data },
    create: { key: SITE_AVAILABILITY_KEY, value: parsed.data },
  });

  // Bust the whole storefront layout (the gate lives there) + this page.
  revalidatePath("/", "layout");
  revalidatePath("/admin/maintenance");
  return { ok: true };
}
