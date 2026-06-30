import { requireSection } from "@/lib/guards";

export default async function ProductsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("products");
  return <>{children}</>;
}
