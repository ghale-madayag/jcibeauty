import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Create a URL-friendly slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a human-friendly order number, e.g. JCI-7F3A2C. */
export function generateOrderNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JCI-${rand}`;
}
