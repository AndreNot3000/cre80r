import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { projects } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";
import { updateProjectStatusSchema } from "@crea8or/validators";

// PATCH /api/projects/:id/status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const json = await request.json();
    const parsed = updateProjectStatusSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { status } = parsed.data;

    const [updated] = await db
      .update(projects)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/projects/:id/status error:", err);
    return NextResponse.json({ error: "Failed to update project status" }, { status: 500 });
  }
}
