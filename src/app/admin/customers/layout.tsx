import { requireSection } from "@/lib/guards";

export default async function CustomersAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("customers");
  return <>{children}</>;
}
