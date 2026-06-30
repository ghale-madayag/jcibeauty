import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-5 py-12">
      <Link
        href="/"
        aria-label={SITE.name}
        className="relative mb-8 block h-12 w-48"
      >
        <Image
          src="/images/JCI%20Beauty.webp"
          alt={SITE.name}
          fill
          priority
          sizes="192px"
          className="object-contain"
        />
      </Link>
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
