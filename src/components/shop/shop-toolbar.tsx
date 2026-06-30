"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SHOP_SORT_OPTIONS,
  SHOP_PRICE_RANGES,
  SHOP_RATING_OPTIONS,
} from "@/lib/constants";
import type { CategoryListItem } from "@/features/categories/category.service";

const CHIP = "h-9 w-auto min-w-[8.5rem] rounded-md bg-card text-sm";

export function ShopToolbar({
  categories,
  total,
  from,
  to,
}: {
  categories: CategoryListItem[];
  total: number;
  from: number;
  to: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "popular";
  const price = params.get("price") ?? "all";
  const rating = params.get("minRating") ?? "all";
  const view = params.get("view") === "list" ? "list" : "grid";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all" || !value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.push(`/shop?${next.toString()}`);
  }

  function setView(value: "grid" | "list") {
    const next = new URLSearchParams(params.toString());
    if (value === "grid") next.delete("view");
    else next.set("view", value);
    router.push(`/shop?${next.toString()}`);
  }

  const hasFilters =
    category !== "all" || price !== "all" || rating !== "all" || sort !== "popular";

  function clearAll() {
    router.push("/shop");
  }

  return (
    <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
      {/* Sort + filter chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-sm font-medium text-muted-foreground">
          Sort by
        </span>

        <Select value={sort} onValueChange={(v) => update("sort", v)}>
          <SelectTrigger className={CHIP}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHOP_SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger className={CHIP}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={price} onValueChange={(v) => update("price", v)}>
          <SelectTrigger className={CHIP}>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            {SHOP_PRICE_RANGES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={rating} onValueChange={(v) => update("minRating", v)}>
          <SelectTrigger className={CHIP}>
            <SelectValue placeholder="Review" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            {SHOP_RATING_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <X className="size-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Result count + view toggle */}
      <div className="flex items-center justify-between gap-4 lg:justify-end">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? (
            "No results"
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {from}&ndash;{to}
              </span>{" "}
              of <span className="font-medium text-foreground">{total}</span>{" "}
              results
            </>
          )}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors",
              view === "list"
                ? "text-gold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors",
              view === "grid"
                ? "text-gold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
