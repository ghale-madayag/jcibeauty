import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";

export type TreatmentService = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  durationMin: number;
  price: number;
};

function map(s: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  durationMin: number;
  price: unknown;
}): TreatmentService {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    image: s.image,
    durationMin: s.durationMin,
    price: toNumber(s.price as never),
  };
}

export const treatmentService = {
  async list(): Promise<TreatmentService[]> {
    const rows = await db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(map);
  },

  async getBySlug(slug: string): Promise<TreatmentService | null> {
    const row = await db.service.findUnique({ where: { slug } });
    return row ? map(row) : null;
  },

  /** Services that have at least one active staff member assigned. */
  async listBookable(): Promise<TreatmentService[]> {
    const rows = await db.service.findMany({
      where: { isActive: true, staff: { some: { staff: { isActive: true } } } },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(map);
  },
};
