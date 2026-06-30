import { requireSection } from "@/lib/guards";

export default async function OrdersAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("orders");
  return <>{children}</>;
}
