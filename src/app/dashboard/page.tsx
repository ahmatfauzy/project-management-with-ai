import { getSessionUser, getRoleDashboardPath } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

/**
 * Main Dashboard Page
 * Redirects users to their role-specific dashboard
 */
export default async function DashboardPage() {
  const user = await getSessionUser();

  // Redirect to role-specific dashboard
  const dashboardPath = getRoleDashboardPath(user.role);
  redirect(dashboardPath);
}

