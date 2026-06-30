import Link from "next/link";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { CategoryStrip } from "@/components/shop/category-strip";
import { Button } from "@/components/ui/button";
import { productService } from "@/features/products/product.service";
import { categoryService } from "@/features/categories/category.service";
import { productFilterSchema } from "@/features/products/product.schema";

export const metadata: Metadata = {
  title: "Shop",
  description: "Premium skincare, makeup, hair, and body essentials.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = productFilterSchema.parse({
    category: sp.category,
    search: sp.search,
    sort: sp.sort,
    price: sp.price,
    minRating: sp.minRating,
    page: sp.page,
  });
  const view = sp.view === "list" ? "list" : "grid";

  const [result, categories] = await Promise.all([
    productService.list(filter),
    categoryService.listWithCounts(),
  ]);

  const from =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  function pageHref(page: number) {
    const next = new URLSearchParams();
    if (filter.category) next.set("category", filter.category);
    if (filter.sort && filter.sort !== "popular") next.set("sort", filter.sort);
    if (filter.price) next.set("price", filter.price);
    if (filter.minRating != null) next.set("minRating", String(filter.minRating));
    if (view === "list") next.set("view", "list");
    next.set("page", String(page));
    return `/shop?${next.toString()}`;
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <header className="mb-10 text-center">
        <span className="text-xs font-medium uppercase tracking-luxe text-gold">
          The Collection
        </span>
        <h1 className="mt-2 font-serif text-4xl">Shop</h1>
      </header>

      <CategoryStrip categories={categories} active={filter.category} />

      <div className="mt-12">
        <ShopToolbar
          categories={categories}
          total={result.total}
          from={from}
          to={to}
        />
      </div>

      <div className="mt-10">
        <ProductGrid products={result.items} view={view} />
      </div>

      {result.totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
          >
            <Link href={pageHref(result.page - 1)}>Previous</Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {result.page} of {result.totalPages}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
          >
            <Link href={pageHref(result.page + 1)}>Next</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
