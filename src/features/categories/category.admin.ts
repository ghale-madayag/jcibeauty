import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { CategoryInput } from "./category.schema";

export const categoryAdminService = {
  async getForEdit(id: string) {
    const c = await db.category.findUnique({ where: { id } });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image: c.image ?? "",
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    };
  },

  create(input: CategoryInput) {
    return db.category.create({
      data: {
        name: input.name,
        slug: input.slug?.trim() || slugify(input.name),
        description: input.description || null,
        image: input.image || null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
    });
  },

  update(id: string, input: CategoryInput) {
    return db.category.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug?.trim() || slugify(input.name),
        description: input.description || null,
        image: input.image || null,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
    });
  },

  remove(id: string) {
    return db.category.delete({ where: { id } });
  },
};
