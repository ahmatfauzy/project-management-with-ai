import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// ... existing imports ...

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await params;

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(taskId)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }

  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        assignee: true,
        evidences: true,
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Fetch detailed task error:", error);
    // Return the actual error message in dev mode or safe one in prod
    return NextResponse.json(
      { error: "Failed to fetch task", details: String(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: taskId } = await params;

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(taskId)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }
  const body = await req.json();

  // Basic permission check: Owner or PM can update
  // For MVP, we allow assignee to update status, but only PM to update deadline/title

  const updateData: any = {};

  if (body.status) {
    if (body.status === "done") {
      // If employee marks as done, force it to 'review' so PM can audit it
      if (session.user.role === "employee") {
        updateData.status = "review";
      } else {
        updateData.status = "done";
        updateData.completedDate = new Date();
      }
    } else {
      updateData.status = body.status;
    }
  }

  if (body.riskLevel) updateData.riskLevel = body.riskLevel;
  if (body.actualHours) updateData.actualHours = body.actualHours;

  // Hanya PM yang boleh ganti Title/DueDate
  if (session.user.role === "pm" || session.user.role === "hr") {
    if (body.title) updateData.title = body.title;
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate);
    if (body.assigneeId !== undefined) {
      updateData.assigneeId =
        body.assigneeId === "unassigned" ? null : body.assigneeId;
    }
  }

  updateData.updatedAt = new Date();

  try {
    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}
