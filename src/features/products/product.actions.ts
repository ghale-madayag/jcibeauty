"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/guards";
import { productInputSchema } from "./product.schema";
import { productAdminService } from "./product.admin";

function parseForm(formData: FormData) {
  // Repeated hidden inputs named "images" (from ImageUploader).
  const images = formData
    .getAll("images")
    .map((v) => String(v).trim())
    .filter(Boolean);

  return productInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    shortDesc: formData.get("shortDesc") || undefined,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    sku: formData.get("sku") || undefined,
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId") || undefined,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    images,
  });
}

export async function createProductAction(
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("products");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  await productAdminService.create(parsed.data);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function updateProductAction(
  id: string,
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("products");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }
  await productAdminService.update(id, parsed.data);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteProductAction(id: string) {
  await requireSection("products");
  await productAdminService.remove(id);
  revalidatePath("/admin/products");
  return { ok: true };
}
