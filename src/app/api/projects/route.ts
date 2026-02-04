import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, tasks, projectMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectsWithTasks = await db.query.projects.findMany({
    with: {
      tasks: {
        columns: {
          status: true,
        },
      },
    },
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });

  const projectsWithProgress = projectsWithTasks.map((project) => {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (t) => t.status === "done",
    ).length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const { tasks, ...rest } = project;
    return {
      ...rest,
      progress,
    };
  });

  return NextResponse.json(projectsWithProgress);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role === "employee") {
    // Only PM and HR can create projects
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  // Basic validation
  if (!body.name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  try {
    // 1. Create Project
    const [newProject] = await db
      .insert(projects)
      .values({
        name: body.name,
        description: body.description,
        managerId: session.user.id,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      })
      .returning();

    // 2. Create Initial Tasks
    if (body.tasks && Array.isArray(body.tasks) && body.tasks.length > 0) {
      const taskData = body.tasks.map((task: any) => ({
        projectId: newProject.id,
        title: task.title,
        description: task.description,
        priority: task.priority || "medium",
        estimatedHours: task.estimatedHours || 0,
        status: "todo",
        creatorId: session.user.id,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        // Tasks created during project init can be assigned
        assigneeId: task.assigneeId || null,
      }));

      console.log(
        "Creating tasks with data:",
        JSON.stringify(taskData, null, 2),
      );

      await db.insert(tasks).values(taskData);
    }

    // 3. Add Project Members
    if (
      body.memberIds &&
      Array.isArray(body.memberIds) &&
      body.memberIds.length > 0
    ) {
      console.log("Adding members:", body.memberIds);
      const memberData = body.memberIds.map((userId: string) => ({
        projectId: newProject.id,
        userId: userId,
      }));
      await db.insert(projectMembers).values(memberData);
    }

    return NextResponse.json(newProject);
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
