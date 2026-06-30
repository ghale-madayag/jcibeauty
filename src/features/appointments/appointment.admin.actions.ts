"use server";

import { revalidatePath } from "next/cache";
import type { AppointmentStatus } from "@prisma/client";
import { requireSection } from "@/lib/guards";
import { db } from "@/lib/db";

const VALID: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export async function updateAppointmentStatusAction(
  id: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireSection("appointments");
  if (!VALID.includes(status as AppointmentStatus)) {
    return { ok: false, error: "Invalid status." };
  }
  await db.appointment.update({
    where: { id },
    data: { status: status as AppointmentStatus },
  });
  revalidatePath("/admin/appointments");
  return { ok: true };
}
