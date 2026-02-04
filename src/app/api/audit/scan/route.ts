import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { analyzeBatchTasksRisk } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { inArray, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch active tasks (todo, in_progress, review)
    const activeTasks = await db.query.tasks.findMany({
      where: inArray(tasks.status, ["todo", "in_progress", "review"]),
      columns: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
      },
    });

    if (activeTasks.length === 0) {
      return NextResponse.json({ message: "No active tasks to scan" });
    }

    // 2. Prepare data for Gemini
    const tasksForAI = activeTasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate?.toISOString() || "",
      status: t.status || "todo",
    }));

    // 3. AI Analysis
    const risks = await analyzeBatchTasksRisk(tasksForAI);

    // 4. Update Database
    // We do this in parallel or bulk if possible, loop is fine for MVP
    let updatedCount = 0;
    for (const risk of risks) {
      await db
        .update(tasks)
        .set({
          riskLevel: risk.riskLevel as "low" | "medium" | "high" | "critical",
          aiRiskAnalysis: risk.reason,
        })
        .where(eq(tasks.id, risk.taskId));
      updatedCount++;
    }

    return NextResponse.json({
      message: "Risk scan completed",
      scanned: activeTasks.length,
      risksFound: risks.length,
    });
  } catch (error) {
    console.error("Risk Scan Error:", error);
    return NextResponse.json(
      { error: "Failed to scan risks" },
      { status: 500 },
    );
  }
}
