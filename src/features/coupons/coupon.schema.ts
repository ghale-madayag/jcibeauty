import { z } from "zod";

export const couponInputSchema = z.object({
  code: z
    .string()
    .min(2, "Code is required")
    .transform((s) => s.trim().toUpperCase()),
  description: z.string().optional(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive("Value must be greater than 0"),
  minSubtotal: z.coerce.number().nonnegative().optional().nullable(),
  maxRedemptions: z.coerce.number().int().positive().optional().nullable(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponInputSchema>;
