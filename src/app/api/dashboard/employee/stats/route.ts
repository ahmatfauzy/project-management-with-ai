import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, lt, gte, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Get all user tasks
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, userId));

    // Calculate stats
    const totalTasks = userTasks.length;
    const doneTasks = userTasks.filter((t) => t.status === "done").length;
    const inProgressTasks = userTasks.filter(
      (t) => t.status === "in_progress",
    ).length;
    const todoTasks = userTasks.filter((t) => t.status === "todo").length;
    const reviewTasks = userTasks.filter((t) => t.status === "review").length;

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = userTasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    }).length;

    // Overdue tasks
    const overdueTasks = userTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < now;
    }).length;

    // Average quality score (if available)
    const tasksWithScore = userTasks.filter(
      (t) => t.qualityScore !== null && t.qualityScore !== undefined,
    );
    const avgQualityScore =
      tasksWithScore.length > 0
        ? Math.round(
            tasksWithScore.reduce((sum, t) => sum + (t.qualityScore || 0), 0) /
              tasksWithScore.length,
          )
        : null;

    // Task distribution by status (for charts)
    const taskDistribution = {
      todo: todoTasks,
      in_progress: inProgressTasks,
      review: reviewTasks,
      done: doneTasks,
    };

    // Task distribution by priority (for charts)
    const highPriority = userTasks.filter((t) => t.priority === "high").length;
    const mediumPriority = userTasks.filter(
      (t) => t.priority === "medium",
    ).length;
    const lowPriority = userTasks.filter((t) => t.priority === "low").length;

    const priorityDistribution = {
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority,
    };

    // Recent completed tasks (last 5)
    const recentCompleted = userTasks
      .filter((t) => t.status === "done")
      .sort((a, b) => {
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        completedDate: t.completedDate,
        qualityScore: t.qualityScore,
      }));

    return NextResponse.json({
      totalTasks,
      doneTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
      upcomingDeadlines,
      overdueTasks,
      avgQualityScore,
      taskDistribution,
      priorityDistribution,
      recentCompleted,
    });
  } catch (error) {
    console.error("Employee stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
