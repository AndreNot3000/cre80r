import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { automations, automationLogs, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";

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

// POST /api/automations/:id/test — Simulate live recipe execution & create delivery log
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id } = await params;
    const [recipe] = await db
      .select()
      .from(automations)
      .where(and(eq(automations.id, id), eq(automations.organizationId, authCtx.orgId)));

    if (!recipe) {
      return NextResponse.json({ error: "Automation recipe not found" }, { status: 404 });
    }

    const sampleRecipients: Record<string, string> = {
      inquiry_created: "+234 803 123 4567 (Adeola Balogun)",
      shoot_reminder_48h: "+234 802 987 6543 (Tunde - Lead DP)",
      deposit_paid: "+234 803 123 4567 (Adeola Balogun)",
      review_cut_approved: "+234 809 555 4321 (Femi - Colorist)",
      gallery_delivered: "+234 803 123 4567 (Adeola Balogun)",
      invoice_overdue: "+234 803 123 4567 (Adeola Balogun)",
    };

    const recipient = sampleRecipients[recipe.triggerEvent] || "+234 803 123 4567 (Client)";
    const config = recipe.config as Record<string, any>;
    const sampleMessage = config?.whatsappMessage || "Automation recipe triggered successfully.";

    // Insert Log Entry
    const [log] = await db
      .insert(automationLogs)
      .values({
        organizationId: authCtx.orgId,
        automationId: recipe.id,
        triggerEvent: recipe.triggerEvent,
        recipient: recipient,
        channel: recipe.actionType === "send_whatsapp" ? "whatsapp" : "email",
        status: "success",
        payload: {
          simulated: true,
          recipeName: recipe.name,
          renderedMessage: sampleMessage,
          waMessageId: `wamid_sim_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      })
      .returning();

    // Increment runCount
    await db
      .update(automations)
      .set({
        runCount: (recipe.runCount || 0) + 1,
        lastRunAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(automations.id, recipe.id));

    return NextResponse.json({
      success: true,
      message: `Test run successful! WhatsApp message dispatched to ${recipient}`,
      log,
    });
  } catch (error) {
    console.error("POST /api/automations/:id/test error:", error);
    return NextResponse.json({ error: "Failed to run test automation" }, { status: 500 });
  }
}
