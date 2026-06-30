"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/guards";
import { categoryInputSchema } from "./category.schema";
import { categoryAdminService } from "./category.admin";

function parse(formData: FormData) {
  return categoryInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    image: formData.get("image") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCategoryAction(
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("categories");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await categoryAdminService.create(parsed.data);
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategoryAction(
  id: string,
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("categories");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await categoryAdminService.update(id, parsed.data);
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  await requireSection("categories");
  try {
    await categoryAdminService.remove(id);
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot delete a category that has products." };
  }
}
