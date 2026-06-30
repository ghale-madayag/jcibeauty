export const SITE = {
  name: "JCI Beauty",
  tagline: "We Make You Be More Beautiful",
  description:
    "Where medical precision meets radiant self-care. Premium skincare, makeup, and clinical beauty treatments.",
  email: "operation@jcibeauty.com",
  phone: "0873434",
  hours: "Mon–Sun 8:00am – 5:00pm",
  freeShippingThreshold: 1999,
} as const;

export const MAIN_NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Book Appointment", href: "/book" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const SHOP_SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
] as const;

export type ShopSort = (typeof SHOP_SORT_OPTIONS)[number]["value"];

export const SHOP_PRICE_RANGES = [
  { label: "Under ₱800", value: "0-800" },
  { label: "₱800 – ₱1,200", value: "800-1200" },
  { label: "₱1,200 – ₱1,600", value: "1200-1600" },
  { label: "Over ₱1,600", value: "1600-" },
] as const;

export const SHOP_RATING_OPTIONS = [
  { label: "4 stars & up", value: "4" },
  { label: "3 stars & up", value: "3" },
  { label: "2 stars & up", value: "2" },
] as const;

export const PRODUCTS_PER_PAGE = 12;

// Booking rules
/** Earliest bookable date = today + this many days (advance-notice window). */
export const BOOKING_MIN_ADVANCE_DAYS = 2;
/** Minutes between candidate appointment start times (1h30). */
export const BOOKING_SLOT_STEP_MIN = 90;

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
