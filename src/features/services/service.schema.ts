import { z } from "zod";

export const serviceInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  durationMin: z.coerce.number().int().min(5, "Duration must be at least 5 min"),
  bufferMin: z.coerce.number().int().min(0).default(0),
  price: z.coerce.number().nonnegative("Price must be >= 0"),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
