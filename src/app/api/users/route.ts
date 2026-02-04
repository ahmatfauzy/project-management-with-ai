import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role !== "hr" && session.user.role !== "pm")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await db.select().from(user);
  return NextResponse.json(users);
}
