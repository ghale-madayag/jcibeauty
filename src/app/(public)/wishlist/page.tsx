import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <header className="mb-8 text-center">
        <span className="text-xs font-medium uppercase tracking-luxe text-gold">
          Saved For Later
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold">Your Wishlist</h1>
      </header>
      <WishlistView />
    </div>
  );
}
