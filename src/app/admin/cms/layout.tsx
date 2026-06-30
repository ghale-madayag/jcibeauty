import { requireSection } from "@/lib/guards";

export default async function CmsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("cms");
  return <>{children}</>;
}
