import type { Metadata } from "next";
import { Barlow, Prompt } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/constants";

// Glowify typography: Barlow (display/headings) + Prompt (body).
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: [{ url: "/images/favicon.webp?v=2", type: "image/webp" }],
    shortcut: "/images/favicon.webp?v=2",
    apple: "/images/favicon.webp?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${prompt.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla,
          Grammarly) inject attributes like `cz-shortcut-listen` into <body>
          before React hydrates, causing a harmless attribute mismatch. */}
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
