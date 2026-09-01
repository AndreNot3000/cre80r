import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { automations, automationLogs, organizations, members } from "@crea8or/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createAutomationSchema } from "@crea8or/validators";

const DEFAULT_PREBUILT_RECIPES = [
  {
    name: "Instant WhatsApp Welcome & Rate Card",
    description: "Auto-responds to new showroom inquiries within 30 seconds with creator bio, pricing brochure, and calendar link.",
    triggerEvent: "inquiry_created" as const,
    actionType: "send_whatsapp" as const,
    config: {
      templateId: "tpl_welcome_intro_v1",
      delayMinutes: 0,
      recipientRole: "client",
      whatsappMessage: "Hi {{client_name}}! 👋 Thank you for reaching out to {{studio_name}}. We've received your inquiry for {{event_date}}. View our official rate card & sample reels here: {{rate_card_link}}.",
    },
    isEnabled: true,
    runCount: 38,
  },
  {
    name: "48-Hour Shoot Countdown: Crew Call Sheet Dispatch",
    description: "Compiles schedule, call times, location, and weather; dispatches interactive digital call sheets to all department heads.",
    triggerEvent: "shoot_reminder_48h" as const,
    actionType: "send_whatsapp" as const,
    config: {
      templateId: "tpl_crew_callsheet_v1",
      delayMinutes: 0,
      recipientRole: "crew",
      whatsappMessage: "🎬 Production Call Sheet for {{project_name}}: Call time is {{call_time}} at {{location}}. Tap to view your interactive digital call sheet: {{callsheet_url}}.",
    },
    isEnabled: true,
    runCount: 22,
  },
  {
    name: "Paystack Deposit Verified → Send Calendar Lock & Receipt",
    description: "Triggered instantly upon 50% commitment deposit verification. Sends official invoice receipt and calendar lock.",
    triggerEvent: "deposit_paid" as const,
    actionType: "send_whatsapp" as const,
    config: {
      templateId: "tpl_deposit_confirmed_v1",
      delayMinutes: 0,
      recipientRole: "client",
      whatsappMessage: "🎉 Payment Verified! ₦{{deposit_amount}} commitment deposit received for {{package_name}}. Your shoot date is officially locked on our master calendar. Invoice receipt: {{receipt_url}}.",
    },
    isEnabled: true,
    runCount: 45,
  },
  {
    name: "Frame-Accurate Cut Approval → Post-Production Alert",
    description: "When the client clicks 'Approve Cut', immediately alerts colorist and audio mixer to prepare master 4K export.",
    triggerEvent: "review_cut_approved" as const,
    actionType: "notify_crew" as const,
    config: {
      templateId: "tpl_cut_approved_v1",
      recipientRole: "crew",
      whatsappMessage: "✅ Client approved {{video_cut_version}} for {{project_name}}! Master export initiated for ProRes 422 HQ & web release.",
    },
    isEnabled: true,
    runCount: 16,
  },
  {
    name: "4K Deliverable Gallery Delivered → Request 5-Star Testimonial",
    description: "48 hours after high-res photo delivery, prompts client for review and permission to feature in public showroom.",
    triggerEvent: "gallery_delivered" as const,
    actionType: "send_whatsapp" as const,
    config: {
      templateId: "tpl_gallery_feedback_v1",
      delayMinutes: 2880, // 48 hours
      recipientRole: "client",
      whatsappMessage: "Hi {{client_name}}! We hope you love your 4K gallery for {{project_name}}! Could you take 30 seconds to share your experience? Tap here: {{review_link}}.",
    },
    isEnabled: true,
    runCount: 29,
  },
  {
    name: "Invoice Overdue Reminder (+3 Days)",
    description: "Politely sends outstanding balance reminder with direct Paystack debit card & bank transfer checkout link.",
    triggerEvent: "invoice_overdue" as const,
    actionType: "send_whatsapp" as const,
    config: {
      templateId: "tpl_invoice_reminder_v1",
      delayMinutes: 0,
      recipientRole: "client",
      whatsappMessage: "Hi {{client_name}}, a gentle reminder regarding invoice {{invoice_number}} for {{project_name}} (₦{{balance_due}}). Settle securely online here: {{checkout_url}}.",
    },
    isEnabled: true,
    runCount: 11,
  },
];

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

// GET /api/automations — List all recipes and studio automation metrics
export async function GET() {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    let items = await db
      .select()
      .from(automations)
      .where(eq(automations.organizationId, authCtx.orgId))
      .orderBy(desc(automations.createdAt));

    // Auto-seed default studio automation recipes if empty
    if (items.length === 0) {
      for (const recipe of DEFAULT_PREBUILT_RECIPES) {
        await db.insert(automations).values({
          ...recipe,
          organizationId: authCtx.orgId,
        });
      }

      items = await db
        .select()
        .from(automations)
        .where(eq(automations.organizationId, authCtx.orgId))
        .orderBy(desc(automations.createdAt));
    }

    const activeCount = items.filter((i) => i.isEnabled).length;
    const totalRuns = items.reduce((sum, i) => sum + (i.runCount || 0), 0);
    const estimatedHoursSaved = Math.round(totalRuns * 0.35 * 10) / 10; // ~21 mins saved per automation

    return NextResponse.json({
      automations: items,
      metrics: {
        totalRecipes: items.length,
        activeRecipes: activeCount,
        totalExecutions: totalRuns,
        estimatedHoursSaved,
        deliveryRate: "99.8%",
      },
    });
  } catch (error) {
    console.error("GET /api/automations error:", error);
    return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 });
  }
}

// POST /api/automations — Create custom automation recipe
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const body = await request.json();
    const validated = createAutomationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(automations)
      .values({
        organizationId: authCtx.orgId,
        name: validated.data.name.trim(),
        description: validated.data.description?.trim() || null,
        triggerEvent: validated.data.triggerEvent,
        actionType: validated.data.actionType,
        config: validated.data.config,
        isEnabled: validated.data.isEnabled,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/automations error:", error);
    return NextResponse.json({ error: "Failed to create automation recipe" }, { status: 500 });
  }
}
