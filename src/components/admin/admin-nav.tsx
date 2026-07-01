"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Receipt,
  Users,
  Sparkles,
  UserCog,
  CalendarDays,
  Ticket,
  LayoutTemplate,
  Settings,
  ShieldCheck,
  Wrench,
  CircleUser,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccess, type AdminSection } from "@/lib/permissions";

const links: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  section: AdminSection;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "dashboard", exact: true },
  { href: "/admin/orders", label: "Orders", icon: Receipt, section: "orders" },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays, section: "appointments" },
  { href: "/admin/products", label: "Products", icon: ShoppingBag, section: "products" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, section: "categories" },
  { href: "/admin/customers", label: "Customers", icon: Users, section: "customers" },
  { href: "/admin/services", label: "Services", icon: Sparkles, section: "services" },
  { href: "/admin/staff", label: "Staff", icon: UserCog, section: "staff" },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, section: "coupons" },
  { href: "/admin/cms", label: "Homepage CMS", icon: LayoutTemplate, section: "cms" },
  { href: "/admin/users", label: "Users", icon: ShieldCheck, section: "users" },
  { href: "/admin/maintenance", label: "Maintenance", icon: Wrench, section: "maintenance" },
  { href: "/admin/settings", label: "Settings", icon: Settings, section: "settings" },
];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const visible = links.filter((l) => canAccess(role, l.section));

  return (
    <nav className="flex flex-col gap-0.5">
      {visible.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary",
            )}
          >
            <l.icon className="size-4" /> {l.label}
          </Link>
        );
      })}

      {/* Always available — manage your own account */}
      <Link
        href="/admin/account"
        className={cn(
          "mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          pathname.startsWith("/admin/account")
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary",
        )}
      >
        <CircleUser className="size-4" /> My Account
      </Link>
    </nav>
  );
}
