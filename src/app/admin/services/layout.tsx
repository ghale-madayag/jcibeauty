import { requireSection } from "@/lib/guards";

export default async function ServicesAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("services");
  return <>{children}</>;
}
