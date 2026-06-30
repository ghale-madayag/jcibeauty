import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { slugify } from "@/lib/utils";
import type { ProductInput } from "./product.schema";

export const productAdminService = {
  async listAll() {
    const rows = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: toNumber(p.price),
      stock: p.stock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      categoryName: p.category?.name ?? null,
      image: p.images[0]?.url ?? null,
    }));
  },

  async getForEdit(id: string) {
    const p = await db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      shortDesc: p.shortDesc ?? "",
      price: toNumber(p.price),
      compareAtPrice: p.compareAtPrice ? toNumber(p.compareAtPrice) : null,
      sku: p.sku,
      stock: p.stock,
      categoryId: p.categoryId,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      images: p.images.map((i) => i.url),
    };
  },

  async create(input: ProductInput) {
    const slug = input.slug?.trim() || slugify(input.name);
    return db.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        shortDesc: input.shortDesc,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        sku: input.sku || null,
        stock: input.stock,
        categoryId: input.categoryId || null,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        images: {
          create: input.images.map((url, i) => ({ url, sortOrder: i })),
        },
      },
    });
  },

  async update(id: string, input: ProductInput) {
    const slug = input.slug?.trim() || slugify(input.name);
    return db.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          name: input.name,
          slug,
          description: input.description,
          shortDesc: input.shortDesc,
          price: input.price,
          compareAtPrice: input.compareAtPrice ?? null,
          sku: input.sku || null,
          stock: input.stock,
          categoryId: input.categoryId || null,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          images: {
            create: input.images.map((url, i) => ({ url, sortOrder: i })),
          },
        },
      });
    });
  },

  async remove(id: string) {
    return db.product.delete({ where: { id } });
  },
};
