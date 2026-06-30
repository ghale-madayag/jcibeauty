import { z } from "zod";

export const productFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z
    .enum(["popular", "newest", "price-asc", "price-desc"])
    .default("popular"),
  // Price bucket encoded as "min-max" (either side may be empty), e.g. "800-1200".
  price: z.string().optional(),
  // Minimum average rating, e.g. 4 = "4 stars & up".
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

/** Admin create/update payload. */
export const productInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  price: z.coerce.number().nonnegative("Price must be >= 0"),
  compareAtPrice: z.coerce.number().nonnegative().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;
