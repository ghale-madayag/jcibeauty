import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";
import { slugify } from "@/lib/utils";
import type { ServiceInput } from "./service.schema";

export const serviceAdminService = {
  async getForEdit(id: string) {
    const s = await db.service.findUnique({ where: { id } });
    if (!s) return null;
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description ?? "",
      image: s.image ?? "",
      durationMin: s.durationMin,
      bufferMin: s.bufferMin,
      price: toNumber(s.price),
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    };
  },

  create(input: ServiceInput) {
    return db.service.create({
      data: {
        name: input.name,
        slug: input.slug?.trim() || slugify(input.name),
        description: input.description || null,
        image: input.image || null,
        durationMin: input.durationMin,
        bufferMin: input.bufferMin,
        price: input.price,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
    });
  },

  update(id: string, input: ServiceInput) {
    return db.service.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug?.trim() || slugify(input.name),
        description: input.description || null,
        image: input.image || null,
        durationMin: input.durationMin,
        bufferMin: input.bufferMin,
        price: input.price,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
    });
  },

  remove(id: string) {
    return db.service.delete({ where: { id } });
  },
};
