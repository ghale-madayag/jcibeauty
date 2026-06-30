"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, LayoutDashboard, CircleUser, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/auth.actions";
import { canAccessPanel } from "@/lib/permissions";

/**
 * The storefront is guest-only — customers never sign in. This menu only
 * appears for a signed-in panel user (Admin or Shop Manager), giving quick
 * access to the admin panel.
 */
export function AccountMenu() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !canAccessPanel(session.user.role)) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Admin account">
          <User className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{session.user.name}</span>
          <span className="block text-xs text-muted-foreground">
            {session.user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin">
            <LayoutDashboard /> Admin Panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/account">
            <CircleUser /> My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            logoutAction();
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
