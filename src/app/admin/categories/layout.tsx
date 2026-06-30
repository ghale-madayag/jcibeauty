import { requireSection } from "@/lib/guards";

export default async function CategoriesAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("categories");
  return <>{children}</>;
}
