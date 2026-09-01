import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@crea8or/db/client";
import { automationLogs, automations } from "@crea8or/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const whatsappRoutes = new Hono();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "crea8or_whatsapp_verify_token_2026";

const sendSchema = z.object({
  recipientPhone: z.string().min(6),
  recipientName: z.string().optional(),
  templateId: z.string().optional(),
  customMessage: z.string().optional(),
  variables: z.record(z.any()).default({}),
  triggerEvent: z.string().default("manual_dispatch"),
});

// GET /api/whatsapp/templates
whatsappRoutes.get("/templates", (c) => {
  return c.json({
    channel: "Meta WhatsApp Cloud API v20.0",
    templates: [
      { id: "tpl_welcome_intro_v1", name: "Showroom Inquiry Welcome", category: "MARKETING" },
      { id: "tpl_deposit_confirmed_v1", name: "Paystack Deposit Verified", category: "TRANSACTIONAL" },
      { id: "tpl_crew_callsheet_v1", name: "48-Hour Crew Digital Call Sheet", category: "OPERATIONS" },
      { id: "tpl_cut_approved_v1", name: "Frame-Accurate Cut Approved Alert", category: "POST-PRODUCTION" },
      { id: "tpl_gallery_feedback_v1", name: "4K Deliverable Gallery Review Prompt", category: "MARKETING" },
      { id: "tpl_invoice_reminder_v1", name: "Outstanding Balance Reminder", category: "FINANCE" },
    ],
  });
});

// GET /api/whatsapp/webhook — Meta Verification
whatsappRoutes.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    return c.text(challenge || "");
  }
  return c.json({ error: "Forbidden" }, 403);
});

// POST /api/whatsapp/webhook — Inbound Events
whatsappRoutes.post("/webhook", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({ received: true });
});

// POST /api/whatsapp/send
whatsappRoutes.post("/send", requireAuth, zValidator("json", sendSchema), async (c) => {
  const user = c.get("user");
  const orgId = user?.organizationId;
  if (!orgId) return c.json({ error: "No active organization" }, 400);

  const data = c.req.valid("json");
  const messageBody = data.customMessage || "Automated production notification from Crea8or Studio OS.";
  const waMessageId = `wamid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const [log] = await db
    .insert(automationLogs)
    .values({
      organizationId: orgId,
      triggerEvent: data.triggerEvent,
      recipient: `${data.recipientPhone} (${data.recipientName || "Client"})`,
      channel: "whatsapp",
      status: "success",
      payload: {
        templateId: data.templateId || "custom",
        renderedMessage: messageBody,
        variables: data.variables,
        waMessageId,
        dispatchedAt: new Date().toISOString(),
      },
    })
    .returning();

  return c.json({
    success: true,
    logId: log.id,
    waMessageId,
    recipient: log.recipient,
  });
});

export { whatsappRoutes };
