import { requireSection } from "@/lib/guards";

export default async function UsersAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("users");
  return <>{children}</>;
}
