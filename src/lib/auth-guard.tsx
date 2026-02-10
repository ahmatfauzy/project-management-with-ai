import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "employee" | "pm" | "hr";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  status: string;
  department?: string;
}

/**
 * Check if user has required role(s)
 * @param allowedRoles Array of roles that are allowed to access
 * @returns Session user data if authorized
 * @throws Redirects to appropriate page if unauthorized
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  const userRole = session.user.role as UserRole;

  // Check if user role is in allowed roles
  if (!allowedRoles.includes(userRole)) {
    // Redirect to their appropriate dashboard
    const roleRedirects: Record<UserRole, string> = {
      hr: "/dashboard/hr",
      pm: "/dashboard/pm",
      employee: "/dashboard/employee",
    };

    redirect(roleRedirects[userRole] || "/dashboard");
  }

  return session.user as SessionUser;
}

/**
 * Get current user session (no role check)
 */
export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  return session.user as SessionUser;
}

/**
 * Check if user has specific role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Get redirect path based on user role
 */
export function getRoleDashboardPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    hr: "/dashboard/hr",
    pm: "/dashboard/pm",
    employee: "/dashboard/employee",
  };
  return paths[role] || "/dashboard/employee";
}
