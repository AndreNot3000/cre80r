import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { projects, clients, members } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";
import { updateProjectSchema } from "@crea8or/validators";

async function getAuthContext() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  let orgId = (session.session as any)?.activeOrganizationId || (session.user as any)?.organizationId;

  if (!orgId) {
    const [membership] = await db
      .select()
      .from(members)
      .where(eq(members.userId, session.user.id));

    if (membership) {
      orgId = membership.organizationId;
    }
  }

  return { user: session.user, orgId };
}

// GET /api/projects/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: projectId } = await params;

    const [result] = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        coverImage: projects.coverImage,
        shootDate: projects.shootDate,
        deliveryDate: projects.deliveryDate,
        notes: projects.notes,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientId: projects.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        clientAddress: clients.address,
        clientCity: clients.city,
        bookingId: projects.bookingId,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, projectId));

    if (!result) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/projects/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PATCH /api/projects/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: projectId } = await params;
    const json = await request.json();
    const parsed = updateProjectSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [updated] = await db
      .update(projects)
      .set({
        name: body.name ? body.name.trim() : undefined,
        description: body.description !== undefined ? (body.description ? body.description.trim() : null) : undefined,
        status: body.status,
        coverImage: body.coverImage !== undefined ? body.coverImage : undefined,
        shootDate: body.shootDate !== undefined ? (body.shootDate ? new Date(body.shootDate) : null) : undefined,
        deliveryDate: body.deliveryDate !== undefined ? (body.deliveryDate ? new Date(body.deliveryDate) : null) : undefined,
        notes: body.notes !== undefined ? (body.notes ? body.notes.trim() : null) : undefined,
        clientId: body.clientId !== undefined ? body.clientId : undefined,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/projects/:id error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: projectId } = await params;

    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, projectId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/projects/:id error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
