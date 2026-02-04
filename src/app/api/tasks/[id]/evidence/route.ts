import { NextResponse } from "next/server";
import { db } from "@/db";
import { taskEvidences, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { analyzeTaskQuality } from "@/lib/ai/gemini";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await params;
  const body = await req.json();

  if (!body.fileUrl) {
    return NextResponse.json(
      { error: "File URL is required" },
      { status: 400 },
    );
  }

  try {
    // 1. Save Evidence
    const [evidence] = await db
      .insert(taskEvidences)
      .values({
        taskId: taskId,
        userId: session.user.id,
        fileUrl: body.fileUrl,
        publicId: body.publicId,
        fileType: body.fileType,
        description: body.description,
      })
      .returning();

    // 1.5 Fetch Task Details for AI Context
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    let qualityScore = 0;
    let qualityAnalysis = "";

    if (task) {
      // 2. Trigger AI Analysis
      const isLate = task.dueDate ? new Date() > new Date(task.dueDate) : false;
      const daysLate = isLate
        ? Math.ceil(
            (new Date().getTime() - new Date(task.dueDate!).getTime()) /
              (1000 * 3600 * 24),
          )
        : 0;

      const aiResult = await analyzeTaskQuality(
        task.title,
        task.description || "No description",
        body.description || "Evidence submitted",
        isLate,
        daysLate,
      );

      qualityScore = aiResult.score;
      qualityAnalysis = aiResult.analysis;
    }

    // 3. Update Task Status & AI Score
    await db
      .update(tasks)
      .set({
        status: "review", // Automatically move to review when evidence is submitted
        qualityScore: qualityScore,
        qualityAnalysis: qualityAnalysis,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("Submit Evidence Error:", error);
    return NextResponse.json(
      { error: "Failed to submit evidence" },
      { status: 500 },
    );
  }
}
