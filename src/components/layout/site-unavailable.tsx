import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import type { SiteMode } from "@/features/site-availability/site-availability.schema";

type Kind = "maintenance" | "comingSoon";

/** Full-screen page shown to guests while a mode is active. */
export function SiteUnavailable({ mode, kind }: { mode: SiteMode; kind: Kind }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faeff2] px-6 py-16 text-center">
      <div className="relative mb-8 h-12 w-48 sm:h-14 sm:w-52">
        <Image
          src="/images/JCI%20Beauty.webp"
          alt={SITE.name}
          fill
          priority
          sizes="208px"
          className="object-contain"
        />
      </div>

      <span className="mb-4 text-xs font-semibold uppercase tracking-luxe text-gold">
        {kind === "maintenance" ? "Scheduled Maintenance" : "Coming Soon"}
      </span>

      <h1 className="max-w-2xl text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
        {mode.heading}
      </h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        {mode.message}
      </p>

      <Link
        href="/login"
        className="mt-12 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-gold"
      >
        Staff sign in
      </Link>
    </div>
  );
}

/** Slim banner shown to signed-in staff so they know a mode is live. */
export function SiteModeBanner({ kind }: { kind: Kind }) {
  const label = kind === "maintenance" ? "Maintenance" : "Coming soon";
  return (
    <div className="bg-gold px-4 py-1.5 text-center text-xs font-medium text-gold-foreground">
      {label} mode is ON — visitors see the {label.toLowerCase()} page. You’re
      signed in, so you can browse normally.
    </div>
  );
}
