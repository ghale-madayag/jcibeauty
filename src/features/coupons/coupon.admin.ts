import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";
import type { CouponInput } from "./coupon.schema";

function toDate(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toInputDate(d: Date | null) {
  // format for <input type="datetime-local">
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const couponAdminService = {
  async getForEdit(id: string) {
    const c = await db.coupon.findUnique({ where: { id } });
    if (!c) return null;
    return {
      id: c.id,
      code: c.code,
      description: c.description ?? "",
      type: c.type as "PERCENT" | "FIXED",
      value: toNumber(c.value),
      minSubtotal: c.minSubtotal ? toNumber(c.minSubtotal) : null,
      maxRedemptions: c.maxRedemptions,
      startsAt: toInputDate(c.startsAt),
      expiresAt: toInputDate(c.expiresAt),
      isActive: c.isActive,
    };
  },

  create(input: CouponInput) {
    return db.coupon.create({
      data: {
        code: input.code,
        description: input.description || null,
        type: input.type,
        value: input.value,
        minSubtotal: input.minSubtotal ?? null,
        maxRedemptions: input.maxRedemptions ?? null,
        startsAt: toDate(input.startsAt),
        expiresAt: toDate(input.expiresAt),
        isActive: input.isActive,
      },
    });
  },

  update(id: string, input: CouponInput) {
    return db.coupon.update({
      where: { id },
      data: {
        code: input.code,
        description: input.description || null,
        type: input.type,
        value: input.value,
        minSubtotal: input.minSubtotal ?? null,
        maxRedemptions: input.maxRedemptions ?? null,
        startsAt: toDate(input.startsAt),
        expiresAt: toDate(input.expiresAt),
        isActive: input.isActive,
      },
    });
  },

  remove(id: string) {
    return db.coupon.delete({ where: { id } });
  },
};
