import { Prisma } from "@prisma/client";

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "PHP";

const LOCALE_BY_CURRENCY: Record<string, string> = {
  PHP: "en-PH",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
};

/** Convert a Prisma.Decimal | number | string to a plain number safely. */
export function toNumber(
  value: Prisma.Decimal | number | string | null | undefined,
): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

/** Format a numeric amount as localized currency. */
export function formatMoney(
  value: Prisma.Decimal | number | string | null | undefined,
  currency: string = CURRENCY,
): string {
  const amount = toNumber(value);
  const locale = LOCALE_BY_CURRENCY[currency] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/** Convert a major-unit amount to Stripe's smallest currency unit (cents). */
export function toStripeAmount(value: number): number {
  return Math.round(value * 100);
}
