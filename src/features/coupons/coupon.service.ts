import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";

export type CouponResult =
  | { valid: true; couponId: string; code: string; discount: number }
  | { valid: false; reason: string };

/** Validate a coupon against a subtotal and compute its discount amount. */
export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon || !coupon.isActive) {
    return { valid: false, reason: "Invalid coupon code." };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, reason: "This coupon is not active yet." };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, reason: "This coupon has expired." };
  }
  if (
    coupon.maxRedemptions != null &&
    coupon.timesRedeemed >= coupon.maxRedemptions
  ) {
    return { valid: false, reason: "This coupon is no longer available." };
  }
  if (coupon.minSubtotal && subtotal < toNumber(coupon.minSubtotal)) {
    return {
      valid: false,
      reason: `Spend at least ${toNumber(coupon.minSubtotal)} to use this coupon.`,
    };
  }

  const value = toNumber(coupon.value);
  const discount =
    coupon.type === "PERCENT"
      ? Math.round(((subtotal * value) / 100) * 100) / 100
      : Math.min(value, subtotal);

  return { valid: true, couponId: coupon.id, code: coupon.code, discount };
}
