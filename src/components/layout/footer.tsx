import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { SITE } from "@/lib/constants";

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "Skincare", href: "/shop?category=skincare" },
  { label: "Serums", href: "/shop?category=serum" },
  { label: "Makeup", href: "/shop?category=makeup" },
];

const helpLinks = [
  { label: "FAQs", href: "/faq" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Book Appointment", href: "/book" },
  { label: "Contact", href: "/contact" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

function Column({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-luxe text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-foreground/80 hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary/40">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative h-16 w-56">
              <Image
                src="/images/JCI%20Beauty.webp"
                alt={SITE.name}
                fill
                sizes="260px"
                className="object-contain object-left"
              />
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {SITE.description}
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <Column title="Shop" links={shopLinks} />
          <Column title="Help" links={helpLinks} />
          <Column title="Company" links={companyLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>
            {SITE.email} · {SITE.hours}
          </p>
        </div>
      </div>
    </footer>
  );
}
