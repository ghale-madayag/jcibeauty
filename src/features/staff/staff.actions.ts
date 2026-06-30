"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guards";
import { timeToMinutes } from "@/lib/slots";
import { staffInputSchema, type ScheduleEntry } from "./staff.schema";
import { staffAdminService } from "./staff.admin";

function parse(formData: FormData) {
  const parsed = staffInputSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") || undefined,
    bio: formData.get("bio") || undefined,
    image: formData.get("image") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
    serviceIds: formData.getAll("serviceIds").map(String),
  });

  // Parse per-day schedule rows.
  const schedules: ScheduleEntry[] = [];
  for (let d = 0; d < 7; d++) {
    if (formData.get(`day_${d}`) !== "on") continue;
    const start = formData.get(`start_${d}`)?.toString();
    const end = formData.get(`end_${d}`)?.toString();
    if (!start || !end) continue;
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    if (endMin > startMin) schedules.push({ dayOfWeek: d, startMin, endMin });
  }

  return { parsed, schedules };
}

export async function createStaffAction(
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireAdmin();
  const { parsed, schedules } = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await staffAdminService.create(parsed.data, schedules);
  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function updateStaffAction(
  id: string,
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireAdmin();
  const { parsed, schedules } = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await staffAdminService.update(id, parsed.data, schedules);
  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function deleteStaffAction(id: string) {
  await requireAdmin();
  try {
    await staffAdminService.remove(id);
    revalidatePath("/admin/staff");
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot delete staff with appointments." };
  }
}
