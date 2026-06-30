import { requireSection } from "@/lib/guards";

export default async function StaffAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("staff");
  return <>{children}</>;
}
