import { requireSection } from "@/lib/guards";

export default async function MaintenanceAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("maintenance");
  return <>{children}</>;
}
