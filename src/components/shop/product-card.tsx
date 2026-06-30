"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/features/cart/cart.store";
import { useWishlist } from "@/features/wishlist/wishlist.store";
import { useMounted } from "@/hooks/use-mounted";
import type { ProductListItem } from "@/features/products/product.types";

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: ProductListItem;
  layout?: "grid" | "list";
}) {
  const isList = layout === "list";
  const addItem = useCart((s) => s.addItem);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const saved = useWishlist((s) => s.items.some((i) => i.productId === product.id));
  const mounted = useMounted();

  const onSale =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPct = onSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart`);
  }

  function handleWishlist() {
    const nowSaved = toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    toast.success(
      nowSaved
        ? `${product.name} added to your wishlist`
        : `${product.name} removed from your wishlist`,
    );
  }

  return (
    <div
      className={cn(
        "group flex overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10",
        isList ? "flex-row items-stretch" : "flex-col",
      )}
    >
      <div className={cn("relative", isList && "w-32 shrink-0 sm:w-52")}>
        <Link
          href={`/shop/${product.slug}`}
          className="relative block aspect-square overflow-hidden bg-secondary"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </Link>

        {onSale && (
          <Badge variant="gold" className="absolute left-3 top-3 shadow-sm">
            Save {discountPct}%
          </Badge>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={mounted ? saved : undefined}
          className={cn(
            "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors",
            mounted && saved
              ? "bg-gold text-gold-foreground"
              : "bg-white/90 text-foreground hover:bg-gold hover:text-gold-foreground",
          )}
        >
          <Heart className={cn("size-4", mounted && saved && "fill-current")} />
        </button>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col p-4",
          isList && "justify-center sm:p-6",
        )}
      >
        {product.categoryName && (
          <span className="text-[0.7rem] uppercase tracking-luxe text-muted-foreground">
            {product.categoryName}
          </span>
        )}
        <Link
          href={`/shop/${product.slug}`}
          className="mt-1 font-serif text-base font-medium leading-snug transition-colors hover:text-gold"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-gold text-gold" />
          <span>({product.ratingAvg.toFixed(1)}/5)</span>
          <span aria-hidden>|</span>
          <span>{product.ratingCount} Sold</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-gold">
            {formatMoney(product.price)}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          )}
        </div>

        <Button
          onClick={handleAdd}
          variant="outline"
          size="sm"
          className={cn(
            "mt-3 hover:border-gold hover:bg-gold hover:text-gold-foreground",
            isList ? "w-full sm:w-48" : "w-full",
          )}
        >
          <ShoppingBag className="size-4" /> Add to cart
        </Button>
      </div>
    </div>
  );
}
