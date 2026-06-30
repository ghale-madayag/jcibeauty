export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
};

export type ProductDetail = ProductListItem & {
  description: string | null;
  shortDesc: string | null;
  sku: string | null;
  images: { url: string; alt: string | null }[];
};

export type ProductListResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
