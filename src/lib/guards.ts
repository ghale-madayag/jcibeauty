import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { canAccess, type AdminSection } from "@/lib/permissions";

/** Ensure the current request is from a signed-in user. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

/** Ensure the current request is from an admin. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

/** Ensure the current user holds one of the given roles. */
export async function requireRole(roles: Role[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!roles.includes(session.user.role)) redirect("/");
  return session;
}

/**
 * Ensure the current user can access an admin section. Signed-in panel users
 * who lack the section are sent back to the dashboard (not the storefront).
 */
export async function requireSection(section: AdminSection) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canAccess(session.user.role, section)) redirect("/admin");
  return session;
}
