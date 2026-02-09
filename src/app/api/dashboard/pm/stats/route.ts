import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, tasks, user, projectMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { count, eq, and, ne } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Overview Stats
    const allProjects = await db.select().from(projects);
    const allTasks = await db.select().from(tasks);

    // Active Tasks = Tasks not done
    const activeTasks = allTasks.filter((t) => t.status !== "done").length;

    // Pending Review = Tasks with status 'review'
    const pendingReview = allTasks.filter((t) => t.status === "review").length;

    // Team Efficiency (Mock Calculation: Completed on time / Total completed)
    // For now, hardcode or randomize slightly around 90%
    const teamEfficiency = 92;

    // 2. Project Status Distribution (Pie Chart)
    const statusCounts = {
      active: allProjects.filter((p) => p.status === "active").length,
      completed: allProjects.filter((p) => p.status === "completed").length,
      planning: allProjects.filter((p) => p.status === "planning").length,
      on_hold: allProjects.filter((p) => p.status === "on_hold").length,
    };

    // 3. Team Workload (Bar Chart) - Top 5 users with most active tasks
    const activeTasksList = allTasks.filter(
      (t) => t.status !== "done" && t.assigneeId,
    );

    // Group by assignee
    const workloadMap: Record<string, number> = {};
    activeTasksList.forEach((t) => {
      if (t.assigneeId) {
        workloadMap[t.assigneeId] = (workloadMap[t.assigneeId] || 0) + 1;
      }
    });

    const workloadData = [];
    for (const [userId, count] of Object.entries(workloadMap)) {
      const userRes = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { name: true },
      });
      if (userRes) {
        workloadData.push({ name: userRes.name, tasks: count });
      }
    }

    // Sort and take top 5
    workloadData.sort((a, b) => b.tasks - a.tasks);
    const topWorkload = workloadData.slice(0, 5);

    return NextResponse.json({
      stats: {
        totalProjects: allProjects.length,
        activeTasks,
        teamEfficiency,
        pendingReview,
      },
      projectStatus: statusCounts,
      workload: topWorkload,
    });
  } catch (error) {
    console.error("Dashboard Stats Error", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
