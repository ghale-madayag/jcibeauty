import type { Role } from "@prisma/client";

/**
 * Role-based access for the admin panel.
 *
 * Access is derived purely from a user's `role` — there is no permissions
 * table. This module is the single source of truth, used in three places:
 *   - edge middleware (`auth.config.ts`) to gate `/admin` entry
 *   - server guards (`guards.ts`) for pages and actions
 *   - the client nav (`admin-nav.tsx`) to show only allowed links
 *
 * It only imports the `Role` *type*, so it is safe to use in the edge runtime.
 */

export const ADMIN_SECTIONS = [
  "dashboard",
  "orders",
  "appointments",
  "products",
  "categories",
  "customers",
  "services",
  "staff",
  "coupons",
  "cms",
  "settings",
  "users",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

// Shop Manager: the full customer-facing operation (shop + bookings) but not
// staff management, the homepage CMS, store settings, or user accounts.
const SHOP_MANAGER_SECTIONS: AdminSection[] = [
  "dashboard",
  "orders",
  "appointments",
  "products",
  "categories",
  "customers",
  "services",
  "coupons",
];

const ROLE_SECTIONS: Record<Role, AdminSection[]> = {
  ADMIN: [...ADMIN_SECTIONS],
  SHOP_MANAGER: SHOP_MANAGER_SECTIONS,
  STAFF: [],
  CUSTOMER: [],
};

/** Can this role open the given admin section? */
export function canAccess(
  role: Role | undefined | null,
  section: AdminSection,
): boolean {
  if (!role) return false;
  return ROLE_SECTIONS[role]?.includes(section) ?? false;
}

/** Can this role enter the admin panel at all (has at least one section)? */
export function canAccessPanel(role: Role | undefined | null): boolean {
  if (!role) return false;
  return (ROLE_SECTIONS[role]?.length ?? 0) > 0;
}

/** Roles that can be assigned to a panel account in the Users module. */
export const ASSIGNABLE_ROLES = ["ADMIN", "SHOP_MANAGER"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  SHOP_MANAGER: "Shop Manager",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};
