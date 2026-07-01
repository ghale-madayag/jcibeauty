"use client";

import { useEffect } from "react";
import { useCart } from "@/features/cart/cart.store";

/**
 * Clears the cart once, on mount. Rendered on the order-success page only — so
 * a confirmed payment empties the cart, while cancelling the Stripe session
 * (which returns to /checkout?canceled=1) leaves the cart intact for a retry.
 */
export function ClearCartOnSuccess() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
