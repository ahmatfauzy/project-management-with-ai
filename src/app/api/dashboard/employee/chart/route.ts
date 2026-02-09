import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get last 90 days of task activity
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get all user tasks
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, userId));

    // Group tasks by date (created or completed)
    const tasksByDate = new Map<
      string,
      { completed: number; pending: number }
    >();

    // Initialize last 90 days with 0 values
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (89 - i));
      const dateStr = date.toISOString().split("T")[0];
      tasksByDate.set(dateStr, { completed: 0, pending: 0 });
    }

    // Count completed tasks by completion date
    userTasks.forEach((task) => {
      if (task.completedDate) {
        const completedDate = new Date(task.completedDate);
        if (completedDate >= ninetyDaysAgo) {
          const dateStr = completedDate.toISOString().split("T")[0];
          const current = tasksByDate.get(dateStr) || {
            completed: 0,
            pending: 0,
          };
          tasksByDate.set(dateStr, {
            ...current,
            completed: current.completed + 1,
          });
        }
      }
    });

    // Count pending tasks by creation date
    userTasks
      .filter((t) => t.status !== "done" && t.createdAt !== null)
      .forEach((task) => {
        const createdDate = new Date(task.createdAt!);
        if (createdDate >= ninetyDaysAgo) {
          const dateStr = createdDate.toISOString().split("T")[0];
          const current = tasksByDate.get(dateStr) || {
            completed: 0,
            pending: 0,
          };
          tasksByDate.set(dateStr, {
            ...current,
            pending: current.pending + 1,
          });
        }
      });

    // Convert to array format for chart
    const chartData = Array.from(tasksByDate.entries())
      .map(([date, counts]) => ({
        date,
        completed: counts.completed,
        pending: counts.pending,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Chart data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 },
    );
  }
}
