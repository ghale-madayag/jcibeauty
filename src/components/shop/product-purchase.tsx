"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart.store";
import type { ProductDetail } from "@/features/products/product.types";

export function ProductPurchase({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = React.useState(1);

  const line = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.image,
    stock: product.stock,
  };

  function add() {
    addItem(line, qty);
    toast.success(`${product.name} added to cart`);
  }

  function buyNow() {
    addItem(line, qty);
    router.push("/checkout");
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center rounded-md border">
          <button
            className="px-3 py-2"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            className="px-3 py-2"
            onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
            aria-label="Increase"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={add}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={outOfStock}
        >
          <ShoppingBag className="size-4" />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
        <Button
          onClick={buyNow}
          variant="gold"
          size="lg"
          className="flex-1"
          disabled={outOfStock}
        >
          Buy now
        </Button>
      </div>
    </div>
  );
}
