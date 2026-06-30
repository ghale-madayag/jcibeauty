"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (line, qty = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === line.productId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === line.productId
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + qty, Math.max(i.stock, 1)),
                    }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...line, quantity: qty }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock || qty)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "jci-cart" },
  ),
);
