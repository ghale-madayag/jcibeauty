import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
