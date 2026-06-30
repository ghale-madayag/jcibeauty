import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/features/products/product.types";

export function ProductGrid({
  products,
  view = "grid",
}: {
  products: ProductListItem[];
  view?: "grid" | "list";
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No products found.
      </p>
    );
  }
  const isList = view === "list";
  return (
    <div
      className={cn(
        isList
          ? "flex flex-col gap-5"
          : "grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4",
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} layout={view} />
      ))}
    </div>
  );
}
