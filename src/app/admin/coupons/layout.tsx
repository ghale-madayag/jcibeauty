import { requireSection } from "@/lib/guards";

export default async function CouponsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("coupons");
  return <>{children}</>;
}
