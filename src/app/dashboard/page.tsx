import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role === "hr") {
    redirect("/dashboard/hr");
  }

  if (session.user.role === "pm") {
    redirect("/dashboard/pm");
  }

  if (session.user.role === "employee") {
    redirect("/dashboard/employee");
  }

  return <div>Dashboard</div>;
}
