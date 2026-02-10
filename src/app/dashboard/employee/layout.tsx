import { requireRole } from "@/lib/auth-guard";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only Employee can access /dashboard/employee/* pages
  await requireRole(["employee"]);

  return <>{children}</>;
}
