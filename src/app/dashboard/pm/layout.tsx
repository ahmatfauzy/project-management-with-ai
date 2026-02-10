import { requireRole } from "@/lib/auth-guard";

export default async function PMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only PM can access /dashboard/pm/* pages
  await requireRole(["pm"]);

  return <>{children}</>;
}
