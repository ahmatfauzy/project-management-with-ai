import { NextResponse } from "next/server";
import { db } from "@/db";
import { user, projects, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/dashboard/hr/stats
 * Returns comprehensive HR dashboard statistics
 *
 * @returns HR metrics including employees, approvals, projects, workload, and department distribution
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify HR role
    if (session.user.role !== "hr") {
      return NextResponse.json(
        { success: false, error: "Forbidden - HR access only" },
        { status: 403 },
      );
    }

    // Fetch all users
    const allUsers = await db.select().from(user);

    // Calculate total employees (approved users with employee/pm role)
    const approvedUsers = allUsers.filter(
      (u) =>
        u.emailVerified !== null && (u.role === "employee" || u.role === "pm"),
    );
    const totalEmployees = approvedUsers.length;

    // Calculate pending approvals (users without emailVerified)
    const pendingApprovals = allUsers.filter((u) => u.emailVerified === null);
    const pendingCount = pendingApprovals.length;

    // Get last month's employee count for trend
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthEmployees = allUsers.filter((u) => {
      if (!u.createdAt) return false;
      const createdAt = new Date(u.createdAt!);
      return (
        createdAt < oneMonthAgo &&
        u.emailVerified !== null &&
        (u.role === "employee" || u.role === "pm")
      );
    }).length;

    const employeeGrowth = totalEmployees - lastMonthEmployees;

    // Fetch all projects
    const allProjects = await db.select().from(projects);
    const activeProjects = allProjects.filter(
      (p) => p.status === "active",
    ).length;

    // Fetch all tasks
    const allTasks = await db.select().from(tasks);

    // Calculate average workload (tasks per employee)
    const activeTasks = allTasks.filter(
      (t) => t.status !== "done" && t.assigneeId,
    );
    const avgWorkload =
      totalEmployees > 0
        ? Math.round((activeTasks.length / totalEmployees) * 10) / 10
        : 0;

    // Department distribution
    const departmentCounts: Record<string, number> = {};
    approvedUsers.forEach((user) => {
      const dept = user.department || "Unassigned";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    // Convert to array format for charts
    const departmentDistribution = Object.entries(departmentCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalEmployees) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // User status breakdown
    const userStatusBreakdown = {
      approved: allUsers.filter((u) => u.emailVerified !== null).length,
      pending: pendingApprovals.length,
      total: allUsers.length,
    };

    // Top departments (top 5)
    const topDepartments = departmentDistribution.slice(0, 5);

    // Workload distribution
    const workloadByUser = approvedUsers.map((user) => {
      const userTasks = activeTasks.filter((t) => t.assigneeId === user.id);
      return {
        userId: user.id,
        name: user.name || "Unknown",
        department: user.department || "Unassigned",
        taskCount: userTasks.length,
      };
    });

    // Find overloaded users (more than 10 active tasks)
    const overloadedUsers = workloadByUser.filter((u) => u.taskCount > 10);

    // Calculate trends
    const lastMonthProjects = allProjects.filter((p) => {
      if (!p.createdAt) return false;
      const createdAt = new Date(p.createdAt!);
      return createdAt < oneMonthAgo && p.status === "active";
    }).length;

    const projectGrowth = activeProjects - lastMonthProjects;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          employeeGrowth,
          pendingApprovals: pendingCount,
          activeProjects,
          projectGrowth,
          avgWorkload,
        },
        departmentDistribution,
        topDepartments,
        userStatusBreakdown,
        workloadStats: {
          totalActiveTasks: activeTasks.length,
          avgTasksPerEmployee: avgWorkload,
          overloadedUsers: overloadedUsers.length,
          maxWorkload: Math.max(...workloadByUser.map((u) => u.taskCount), 0),
          minWorkload: Math.min(...workloadByUser.map((u) => u.taskCount), 0),
        },
        pendingApprovalsList: pendingApprovals.slice(0, 5).map((u) => ({
          id: u.id,
          name: u.name || "Unknown",
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("HR stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch HR statistics",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
