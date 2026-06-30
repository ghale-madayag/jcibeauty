import { db } from "@/lib/db";

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  productCount: number;
};

export const categoryService = {
  async listWithCounts(): Promise<CategoryListItem[]> {
    const rows = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      description: c.description,
      productCount: c._count.products,
    }));
  },

  async featured(limit = 4): Promise<CategoryListItem[]> {
    return (await this.listWithCounts()).slice(0, limit);
  },
};
