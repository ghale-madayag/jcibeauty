"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Truck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart/cart-sheet";
import { AccountMenu } from "@/components/layout/account-menu";
import { WishlistButton } from "@/components/layout/wishlist-button";
import { MAIN_NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="overflow-hidden bg-gold py-2 text-gold-foreground">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              aria-hidden={i >= 6}
              className="mr-10 flex items-center gap-2 whitespace-nowrap text-xs font-medium uppercase tracking-luxe"
            >
              <Truck className="size-3.5" />
              Free Shipping on Orders Over ₱{SITE.freeShippingThreshold}
            </span>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "border-b bg-background/90 backdrop-blur-md transition-shadow",
          scrolled && "shadow-sm",
        )}
      >
        <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          {/* Mobile menu */}
          <div className="flex items-center lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-serif text-xl">
                    {SITE.name}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4">
                  {MAIN_NAV.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className="rounded-md px-2 py-3 text-base hover:bg-secondary"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link
            href="/"
            aria-label={SITE.name}
            className="relative block h-11 w-36 sm:w-44 lg:h-12 lg:w-52"
          >
            <Image
              src="/images/JCI%20Beauty.webp"
              alt={SITE.name}
              fill
              priority
              sizes="208px"
              className="object-contain object-left"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {MAIN_NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium tracking-wide transition-colors hover:text-gold",
                    "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-gold after:transition-all after:content-['']",
                    active
                      ? "text-gold after:w-full"
                      : "text-foreground/70 after:w-0 hover:after:w-full",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <AccountMenu />
            <WishlistButton />
            <CartSheet />
          </div>
        </div>
      </div>
    </header>
  );
}
