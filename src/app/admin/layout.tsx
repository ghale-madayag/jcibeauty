import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { logoutAction } from "@/features/auth/auth.actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN", "SHOP_MANAGER"]);
  const role = session.user.role;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card px-4 py-6 lg:flex">
        <Link
          href="/admin"
          aria-label={`${SITE.name} Admin`}
          className="flex items-center gap-2 px-3"
        >
          <span className="relative block h-9 w-32">
            <Image
              src="/images/JCI%20Beauty.webp"
              alt={SITE.name}
              fill
              priority
              sizes="128px"
              className="object-contain object-left"
            />
          </span>
          <span className="text-[0.7rem] font-medium uppercase tracking-luxe text-gold">
            Admin
          </span>
        </Link>
        <div className="mt-8 flex-1">
          <AdminNav role={role} />
        </div>
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/">← Back to store</Link>
          </Button>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex-1 bg-secondary/20">
        <header className="flex h-14 items-center justify-between border-b bg-background px-6 lg:hidden">
          <Link
            href="/admin"
            aria-label={`${SITE.name} Admin`}
            className="relative block h-8 w-28"
          >
            <Image
              src="/images/JCI%20Beauty.webp"
              alt={SITE.name}
              fill
              sizes="112px"
              className="object-contain object-left"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Store</Link>
            </Button>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
