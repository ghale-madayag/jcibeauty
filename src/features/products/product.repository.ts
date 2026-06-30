import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ProductFilter } from "./product.schema";

const listInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
} satisfies Prisma.ProductInclude;

const detailInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductWithList = Prisma.ProductGetPayload<{
  include: typeof listInclude;
}>;
export type ProductWithDetail = Prisma.ProductGetPayload<{
  include: typeof detailInclude;
}>;

/** Parse a "min-max" price bucket; either side may be empty (open-ended). */
function parsePriceBucket(bucket?: string): { min?: number; max?: number } {
  if (!bucket) return {};
  const [minStr, maxStr] = bucket.split("-");
  const min = Number(minStr);
  const max = Number(maxStr);
  return {
    min: minStr !== "" && Number.isFinite(min) ? min : undefined,
    max: maxStr !== "" && Number.isFinite(max) ? max : undefined,
  };
}

function buildWhere(filter: ProductFilter): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filter.category) where.category = { slug: filter.category };

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search } },
      { shortDesc: { contains: filter.search } },
    ];
  }

  const { min, max } = parsePriceBucket(filter.price);
  if (min != null || max != null) {
    where.price = {
      ...(min != null ? { gte: min } : {}),
      ...(max != null ? { lte: max } : {}),
    };
  }

  if (filter.minRating != null) {
    where.ratingAvg = { gte: filter.minRating };
  }

  return where;
}

function buildOrderBy(
  sort: ProductFilter["sort"],
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "newest":
      return { createdAt: "desc" };
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "popular":
    default:
      return { ratingCount: "desc" };
  }
}

export const productRepository = {
  async findMany(filter: ProductFilter, skip: number, take: number) {
    const where = buildWhere(filter);
    const [rows, total] = await Promise.all([
      db.product.findMany({
        where,
        include: listInclude,
        orderBy: buildOrderBy(filter.sort),
        skip,
        take,
      }),
      db.product.count({ where }),
    ]);
    return { rows, total };
  },

  findBySlug(slug: string) {
    return db.product.findUnique({
      where: { slug },
      include: detailInclude,
    });
  },

  findFeatured(take: number) {
    return db.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: listInclude,
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  findNewest(take: number) {
    return db.product.findMany({
      where: { isActive: true },
      include: listInclude,
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  findByIds(ids: string[]) {
    return db.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: listInclude,
    });
  },
};
