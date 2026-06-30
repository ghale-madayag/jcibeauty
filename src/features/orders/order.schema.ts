import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email"),
  fullName: z.string().min(2, "Enter your full name"),
  line1: z.string().min(3, "Enter your address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter your city"),
  state: z.string().optional(),
  postalCode: z.string().min(2, "Enter a postal code"),
  country: z.string().min(2, "Enter a country"),
  phone: z.string().optional(),
  couponCode: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
