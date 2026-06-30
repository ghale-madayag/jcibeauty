"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/features/wishlist/wishlist.store";
import { useMounted } from "@/hooks/use-mounted";

export function WishlistButton() {
  const mounted = useMounted();
  const count = useWishlist((s) => s.items.length);

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label="Wishlist"
      className="relative"
    >
      <Link href="/wishlist">
        <Heart className="size-5" />
        {mounted && count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-semibold text-gold-foreground">
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}
