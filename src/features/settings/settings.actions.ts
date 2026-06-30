"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guards";
import { db } from "@/lib/db";
import { timeToMinutes } from "@/lib/slots";

export async function updateStoreSettingsAction(
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireAdmin();
  const value = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    freeShippingThreshold: Number(formData.get("freeShippingThreshold") || 0),
  };

  await db.setting.upsert({
    where: { key: "store" },
    update: { value },
    create: { key: "store", value },
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function updateBusinessHoursAction(
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireAdmin();

  for (let d = 0; d < 7; d++) {
    const isClosed = formData.get(`closed_${d}`) === "on";
    const open = (formData.get(`open_${d}`) as string) || "08:00";
    const close = (formData.get(`close_${d}`) as string) || "17:00";

    await db.businessHours.upsert({
      where: { dayOfWeek: d },
      update: {
        openMin: timeToMinutes(open),
        closeMin: timeToMinutes(close),
        isClosed,
      },
      create: {
        dayOfWeek: d,
        openMin: timeToMinutes(open),
        closeMin: timeToMinutes(close),
        isClosed,
      },
    });
  }

  revalidatePath("/admin/settings");
  return { ok: true };
}
