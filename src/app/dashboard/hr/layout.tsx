import { requireRole } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only HR can access /dashboard/hr/* pages
  await requireRole(["hr"]);

  return <>{children}</>;
}
