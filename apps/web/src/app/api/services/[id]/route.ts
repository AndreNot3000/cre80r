import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { services, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { updateServiceSchema } from "@crea8or/validators";

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

// GET /api/services/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: serviceId } = await params;

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId));

    if (!service) {
      return NextResponse.json({ error: "Service package not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (err: any) {
    console.error("GET /api/services/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch service package" }, { status: 500 });
  }
}

// PATCH /api/services/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: serviceId } = await params;
    const json = await request.json();
    const parsed = updateServiceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;
    const [updated] = await db
      .update(services)
      .set({
        ...body,
        basePrice: body.basePrice !== undefined ? String(body.basePrice) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(services.id, serviceId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Service package not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/services/:id error:", err);
    return NextResponse.json({ error: "Failed to update service package" }, { status: 500 });
  }
}

// DELETE /api/services/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: serviceId } = await params;

    const [deleted] = await db
      .delete(services)
      .where(eq(services.id, serviceId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Service package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Service package deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/services/:id error:", err);
    return NextResponse.json({ error: "Failed to delete service package" }, { status: 500 });
  }
}
