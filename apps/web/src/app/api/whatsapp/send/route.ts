import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { members, organizations } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";
import { dispatchWhatsAppMessage, WHATSAPP_STANDARD_TEMPLATES } from "@/lib/whatsapp";
import { z } from "zod";

const sendWhatsAppSchema = z.object({
  recipientPhone: z.string().min(6, "Valid phone number is required"),
  recipientName: z.string().optional(),
  templateId: z.string().optional(),
  customMessage: z.string().optional(),
  variables: z.record(z.any()).default({}),
  triggerEvent: z.string().default("manual_dispatch"),
});

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

  if (!orgId) {
    const [firstOrg] = await db.select().from(organizations).limit(1);
    if (firstOrg) orgId = firstOrg.id;
  }

  return { user: session.user, orgId };
}

// POST /api/whatsapp/send — Dispatch a WhatsApp message or template
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const body = await request.json();
    const validated = sendWhatsAppSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const data = validated.data;
    const result = await dispatchWhatsAppMessage({
      organizationId: authCtx.orgId,
      recipientPhone: data.recipientPhone,
      recipientName: data.recipientName,
      templateId: data.templateId,
      customMessage: data.customMessage,
      variables: data.variables,
      triggerEvent: data.triggerEvent,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/whatsapp/send error:", error);
    return NextResponse.json({ error: "Failed to dispatch WhatsApp message" }, { status: 500 });
  }
}
