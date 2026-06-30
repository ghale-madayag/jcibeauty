import { requireSection } from "@/lib/guards";

export default async function SettingsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSection("settings");
  return <>{children}</>;
}
