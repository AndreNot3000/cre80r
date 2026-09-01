import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { automations, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { updateAutomationSchema } from "@crea8or/validators";

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
    if (membership) orgId = membership.organizationId;
  }

  return { user: session.user, orgId };
}

// PATCH /api/automations/:id — Update or toggle automation recipe
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateAutomationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (validated.data.name !== undefined) updatePayload.name = validated.data.name.trim();
    if (validated.data.description !== undefined) updatePayload.description = validated.data.description?.trim() || null;
    if (validated.data.triggerEvent !== undefined) updatePayload.triggerEvent = validated.data.triggerEvent;
    if (validated.data.actionType !== undefined) updatePayload.actionType = validated.data.actionType;
    if (validated.data.config !== undefined) updatePayload.config = validated.data.config;
    if (validated.data.isEnabled !== undefined) updatePayload.isEnabled = validated.data.isEnabled;

    const [updated] = await db
      .update(automations)
      .set(updatePayload)
      .where(and(eq(automations.id, id), eq(automations.organizationId, authCtx.orgId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Automation recipe not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/automations/:id error:", error);
    return NextResponse.json({ error: "Failed to update automation recipe" }, { status: 500 });
  }
}

// DELETE /api/automations/:id — Delete automation recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id } = await params;
    const [deleted] = await db
      .delete(automations)
      .where(and(eq(automations.id, id), eq(automations.organizationId, authCtx.orgId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Automation recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Automation recipe deleted" });
  } catch (error) {
    console.error("DELETE /api/automations/:id error:", error);
    return NextResponse.json({ error: "Failed to delete automation recipe" }, { status: 500 });
  }
}
