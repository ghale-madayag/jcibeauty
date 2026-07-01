import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  SiteUnavailable,
  SiteModeBanner,
} from "@/components/layout/site-unavailable";
import { auth } from "@/lib/auth";
import {
  getSiteAvailability,
  activeSiteMode,
} from "@/features/site-availability/site-availability.service";

// Render the storefront on-demand instead of prerendering at build time.
// These pages read live data (products, services, CMS) from MySQL, so the
// build must not depend on a database connection. Admin edits then show
// immediately, and deploys don't require the DB to be reachable at build.
// Cascades to every page under the (public) route group.
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Maintenance / Coming Soon gate. Guests see the unavailable page; any
  // signed-in panel user sees the live site (with a reminder banner).
  const [availability, session] = await Promise.all([
    getSiteAvailability(),
    auth(),
  ]);
  const active = activeSiteMode(availability);
  const isSignedIn = !!session?.user?.id;

  if (active && !isSignedIn) {
    return <SiteUnavailable mode={active.mode} kind={active.kind} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {active && <SiteModeBanner kind={active.kind} />}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
