"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/features/cart/cart.store";
import { useMounted } from "@/hooks/use-mounted";

export function CartSheet() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());
  const count = useCart((s) => s.count());

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open cart" className="relative">
          <ShoppingBag className="size-5" />
          {mounted && count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-semibold text-gold-foreground">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">Your Cart</SheetTitle>
        </SheetHeader>

        {!mounted || items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <SheetClose asChild>
              <Button asChild variant="gold">
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <span className="mt-1 text-sm text-muted-foreground">
                      {formatMoney(item.price)}
                    </span>
                    <div className="mt-auto flex items-center gap-2">
                      <div className="flex items-center rounded-md border">
                        <button
                          className="px-2 py-1"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 py-1"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label="Increase"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter>
              <Separator className="mb-2" />
              <div className="flex items-center justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping & taxes calculated at checkout.
              </p>
              <SheetClose asChild>
                <Button asChild variant="gold" size="lg" className="w-full">
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/cart">View cart</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
