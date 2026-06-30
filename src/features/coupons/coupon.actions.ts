"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/guards";
import { couponInputSchema } from "./coupon.schema";
import { couponAdminService } from "./coupon.admin";

function parse(formData: FormData) {
  return couponInputSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    value: formData.get("value"),
    minSubtotal: formData.get("minSubtotal") || undefined,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    startsAt: formData.get("startsAt") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCouponAction(
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("coupons");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await couponAdminService.create(parsed.data);
  } catch {
    return { ok: false, error: "A coupon with this code already exists." };
  }
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function updateCouponAction(
  id: string,
  _prev: { ok: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireSection("coupons");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  await couponAdminService.update(id, parsed.data);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCouponAction(id: string) {
  await requireSection("coupons");
  try {
    await couponAdminService.remove(id);
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot delete a coupon used by orders." };
  }
}
