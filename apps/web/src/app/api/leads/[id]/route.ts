import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { leads, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { updateLeadSchema } from "@crea8or/validators";

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

// GET /api/leads/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: leadId } = await params;

    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId));

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (err: any) {
    console.error("GET /api/leads/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

// PATCH /api/leads/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: leadId } = await params;
    const json = await request.json();
    const parsed = updateLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;
    const [updated] = await db
      .update(leads)
      .set({
        ...body,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        budget: body.budget ? String(body.budget) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/leads/:id error:", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

// DELETE /api/leads/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: leadId } = await params;

    const [deleted] = await db
      .delete(leads)
      .where(eq(leads.id, leadId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/leads/:id error:", err);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
