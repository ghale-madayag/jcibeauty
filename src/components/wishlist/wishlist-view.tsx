"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/features/cart/cart.store";
import {
  useWishlist,
  type WishlistItem,
} from "@/features/wishlist/wishlist.store";
import { useMounted } from "@/hooks/use-mounted";

export function WishlistView() {
  const mounted = useMounted();
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const addItem = useCart((s) => s.addItem);

  // Avoid hydration mismatch: the store hydrates from localStorage on the client.
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Heart className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Your wishlist is empty.</p>
        <Button asChild variant="gold" className="mt-6">
          <Link href="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  function moveToCart(item: WishlistItem) {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      stock: item.stock,
    });
    remove(item.productId);
    toast.success(`${item.name} moved to cart`);
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.productId}
          className="group flex flex-col overflow-hidden rounded-xl border bg-card"
        >
          <Link
            href={`/shop/${item.slug}`}
            className="relative block aspect-square overflow-hidden bg-secondary"
          >
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </Link>
          <div className="flex flex-1 flex-col p-4">
            <Link
              href={`/shop/${item.slug}`}
              className="font-serif text-base font-medium transition-colors hover:text-gold"
            >
              {item.name}
            </Link>
            <span className="mt-1 font-semibold text-gold">
              {formatMoney(item.price)}
            </span>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => moveToCart(item)}
                variant="gold"
                size="sm"
                className="flex-1"
              >
                <ShoppingBag className="size-4" /> Add to cart
              </Button>
              <Button
                onClick={() => {
                  remove(item.productId);
                  toast.success(`${item.name} removed from your wishlist`);
                }}
                variant="outline"
                size="icon"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
