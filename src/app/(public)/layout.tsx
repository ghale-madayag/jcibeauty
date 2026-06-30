import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Render the storefront on-demand instead of prerendering at build time.
// These pages read live data (products, services, CMS) from MySQL, so the
// build must not depend on a database connection. Admin edits then show
// immediately, and deploys don't require the DB to be reachable at build.
// Cascades to every page under the (public) route group.
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
