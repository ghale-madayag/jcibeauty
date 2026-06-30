"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  /** Adds if absent, removes if present. Returns true if the item is now saved. */
  toggle: (item: WishlistItem) => boolean;
  has: (productId: string) => boolean;
  clear: () => void;
  count: () => number;
}

/**
 * Guest-friendly wishlist — client-only, persisted to localStorage (same pattern
 * as the cart). No login required; survives across sessions on the device.
 */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) =>
          state.items.some((i) => i.productId === item.productId)
            ? state
            : { items: [...state.items, item] },
        ),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== item.productId),
          }));
          return false;
        }
        set((state) => ({ items: [...state.items, item] }));
        return true;
      },
      has: (productId) => get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    { name: "jci-wishlist" },
  ),
);
