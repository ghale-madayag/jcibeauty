"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import { SITE } from "@/lib/constants";
import { useCart } from "@/features/cart/cart.store";
import { useMounted } from "@/hooks/use-mounted";

export default function CartPage() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto flex max-w-2xl flex-col items-center gap-5 py-28 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="font-serif text-3xl">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Discover our premium collection and treat yourself.
        </p>
        <Button asChild variant="gold" size="lg">
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    );
  }

  const freeShipping = subtotal >= SITE.freeShippingThreshold;

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <h1 className="font-serif text-4xl">Shopping Cart</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-5 py-6 first:pt-0">
              <Link
                href={`/shop/${item.slug}`}
                className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-secondary"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-serif text-lg hover:text-foreground/70"
                  >
                    {item.name}
                  </Link>
                  <span className="font-medium">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                </div>
                <span className="mt-1 text-sm text-muted-foreground">
                  {formatMoney(item.price)} each
                </span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <button
                      className="px-3 py-2"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label="Decrease"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      className="px-3 py-2"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label="Increase"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border bg-card p-6">
          <h2 className="font-serif text-xl">Order Summary</h2>
          <Separator className="my-4" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {freeShipping ? "Free" : "Calculated at checkout"}
              </span>
            </div>
          </div>
          {!freeShipping && (
            <p className="mt-4 rounded-md bg-accent/50 p-3 text-xs text-accent-foreground">
              Spend {formatMoney(SITE.freeShippingThreshold - subtotal)} more for
              free shipping.
            </p>
          )}
          <Button asChild variant="gold" size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
