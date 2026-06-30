import { requireSection } from "@/lib/guards";

export default async function AppointmentsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("appointments");
  return <>{children}</>;
}
