"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/guards";
import { serviceInputSchema } from "./service.schema";
import { serviceAdminService } from "./service.admin";

function parse(formData: FormData) {
  return serviceInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    image: formData.get("image") || undefined,
    durationMin: formData.get("durationMin"),
    bufferMin: formData.get("bufferMin") || 0,
    price: formData.get("price"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createServiceAction(
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("services");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await serviceAdminService.create(parsed.data);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true };
}

export async function updateServiceAction(
  id: string,
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("services");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await serviceAdminService.update(id, parsed.data);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true };
}

export async function deleteServiceAction(id: string) {
  await requireSection("services");
  try {
    await serviceAdminService.remove(id);
    revalidatePath("/admin/services");
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot delete a service with appointments." };
  }
}
