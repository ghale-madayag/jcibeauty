import { toNumber } from "@/lib/money";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import {
  productRepository,
  type ProductWithDetail,
  type ProductWithList,
} from "./product.repository";
import type { ProductFilter } from "./product.schema";
import type {
  ProductDetail,
  ProductListItem,
  ProductListResult,
} from "./product.types";

function toListItem(p: ProductWithList): ProductListItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: toNumber(p.price),
    compareAtPrice: p.compareAtPrice ? toNumber(p.compareAtPrice) : null,
    image: p.images[0]?.url ?? null,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    isFeatured: p.isFeatured,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    stock: p.stock,
  };
}

function toDetail(p: ProductWithDetail): ProductDetail {
  return {
    ...toListItem({ ...p, images: p.images.slice(0, 1) }),
    description: p.description,
    shortDesc: p.shortDesc,
    sku: p.sku,
    images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
  };
}

export const productService = {
  async list(filter: ProductFilter): Promise<ProductListResult> {
    const page = filter.page;
    const skip = (page - 1) * PRODUCTS_PER_PAGE;
    const { rows, total } = await productRepository.findMany(
      filter,
      skip,
      PRODUCTS_PER_PAGE,
    );
    return {
      items: rows.map(toListItem),
      total,
      page,
      pageSize: PRODUCTS_PER_PAGE,
      totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
    };
  },

  async getBySlug(slug: string): Promise<ProductDetail | null> {
    const product = await productRepository.findBySlug(slug);
    return product ? toDetail(product) : null;
  },

  async featured(limit = 6): Promise<ProductListItem[]> {
    return (await productRepository.findFeatured(limit)).map(toListItem);
  },

  async newest(limit = 6): Promise<ProductListItem[]> {
    return (await productRepository.findNewest(limit)).map(toListItem);
  },

  async byIds(ids: string[]): Promise<ProductListItem[]> {
    if (ids.length === 0) return [];
    return (await productRepository.findByIds(ids)).map(toListItem);
  },
};
