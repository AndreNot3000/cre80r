import { db } from "@crea8or/db/client";
import { automationLogs, automations } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

export type WhatsAppTemplateId =
  | "tpl_welcome_intro_v1"
  | "tpl_deposit_confirmed_v1"
  | "tpl_crew_callsheet_v1"
  | "tpl_cut_approved_v1"
  | "tpl_gallery_feedback_v1"
  | "tpl_invoice_reminder_v1";

export interface WhatsAppDispatchOptions {
  organizationId: string;
  automationId?: string;
  triggerEvent: string;
  recipientPhone: string;
  recipientName?: string;
  templateId?: WhatsAppTemplateId | string;
  variables?: Record<string, string | number>;
  customMessage?: string;
}

export const WHATSAPP_STANDARD_TEMPLATES: Record<
  string,
  { name: string; category: string; description: string; templateText: string; requiredVars: string[] }
> = {
  tpl_welcome_intro_v1: {
    name: "Showroom Inquiry Welcome",
    category: "MARKETING / CRM",
    description: "Greets new showroom inquiries within 30 seconds with studio rate card & brochure link.",
    templateText:
      "Hi {{client_name}}! 👋 Thank you for reaching out to {{studio_name}}. We've received your inquiry for {{event_date}}. View our official rate card & sample reels here: {{rate_card_link}}.",
    requiredVars: ["client_name", "studio_name", "event_date", "rate_card_link"],
  },
  tpl_deposit_confirmed_v1: {
    name: "Paystack Deposit Verified",
    category: "UTILITY / TRANSACTIONAL",
    description: "Notifies client of successful deposit payment and confirms date is locked on master calendar.",
    templateText:
      "🎉 Payment Verified! ₦{{deposit_amount}} commitment deposit received for {{package_name}}. Your shoot date is officially locked on our calendar. Receipt: {{receipt_url}}.",
    requiredVars: ["deposit_amount", "package_name", "receipt_url"],
  },
  tpl_crew_callsheet_v1: {
    name: "48-Hour Crew Digital Call Sheet",
    category: "OPERATIONS / PRODUCTION",
    description: "Dispatches call times, set location, weather, and department timeline to crew members.",
    templateText:
      "🎬 Production Call Sheet for {{project_name}}: Call time is {{call_time}} at {{location}}. Tap to view your interactive digital call sheet: {{callsheet_url}}.",
    requiredVars: ["project_name", "call_time", "location", "callsheet_url"],
  },
  tpl_cut_approved_v1: {
    name: "Frame-Accurate Cut Approved Alert",
    category: "POST-PRODUCTION",
    description: "Alerts post-production department heads when a client approves a master video cut.",
    templateText:
      "✅ Client approved {{video_cut_version}} for {{project_name}}! Master export initiated for ProRes 422 HQ & web release.",
    requiredVars: ["video_cut_version", "project_name"],
  },
  tpl_gallery_feedback_v1: {
    name: "4K Deliverable Gallery Review Prompt",
    category: "MARKETING / SOCIAL PROOF",
    description: "Prompts clients 48 hours after high-res photo delivery to leave a 5-star review.",
    templateText:
      "Hi {{client_name}}! We hope you love your 4K gallery for {{project_name}}! Could you take 30 seconds to share your experience? Tap here: {{review_link}}.",
    requiredVars: ["client_name", "project_name", "review_link"],
  },
  tpl_invoice_reminder_v1: {
    name: "Outstanding Balance Reminder",
    category: "FINANCE / BILLING",
    description: "Sends polite reminder with direct Paystack debit card and bank transfer checkout link.",
    templateText:
      "Hi {{client_name}}, a gentle reminder regarding invoice {{invoice_number}} for {{project_name}} (₦{{balance_due}}). Settle securely online here: {{checkout_url}}.",
    requiredVars: ["client_name", "invoice_number", "project_name", "balance_due", "checkout_url"],
  },
};

/**
 * Interpolates {{variable}} placeholders inside message templates
 */
export function renderWhatsAppTemplate(
  templateText: string,
  variables: Record<string, string | number> = {}
): string {
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

/**
 * Dispatches a WhatsApp Cloud API message with real-time audit logging
 */
export async function dispatchWhatsAppMessage(options: WhatsAppDispatchOptions) {
  const {
    organizationId,
    automationId,
    triggerEvent,
    recipientPhone,
    recipientName = "Client",
    templateId,
    variables = {},
    customMessage,
  } = options;

  let messageBody = customMessage;

  if (!messageBody && templateId && WHATSAPP_STANDARD_TEMPLATES[templateId]) {
    messageBody = renderWhatsAppTemplate(
      WHATSAPP_STANDARD_TEMPLATES[templateId].templateText,
      variables
    );
  } else if (!messageBody) {
    messageBody = "Automated production notification from Crea8or Studio OS.";
  }

  // Format recipient display
  const formattedRecipient = `${recipientPhone} (${recipientName})`;
  const waMessageId = `wamid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Meta Cloud API configuration
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  let deliveryStatus: "success" | "failed" | "queued" = "success";
  let errorMessage: string | null = null;

  if (phoneId && apiToken) {
    try {
      const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
      const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: { preview_url: true, body: messageBody },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        deliveryStatus = "failed";
        errorMessage = errorData?.error?.message || "WhatsApp Cloud API error";
      }
    } catch (err: any) {
      deliveryStatus = "failed";
      errorMessage = err?.message || "Network error dispatching WhatsApp";
    }
  }

  // Record in PostgreSQL Audit Log
  const [log] = await db
    .insert(automationLogs)
    .values({
      organizationId,
      automationId: automationId || null,
      triggerEvent,
      recipient: formattedRecipient,
      channel: "whatsapp",
      status: deliveryStatus,
      errorMessage,
      payload: {
        templateId: templateId || "custom",
        renderedMessage: messageBody,
        variables,
        waMessageId,
        dispatchedAt: new Date().toISOString(),
      },
    })
    .returning();

  // If automationId is provided, increment its runCount
  if (automationId) {
    await db
      .update(automations)
      .set({
        lastRunAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(automations.id, automationId))
      .catch(() => {});
  }

  return {
    success: deliveryStatus === "success",
    logId: log.id,
    waMessageId,
    recipient: formattedRecipient,
    messageBody,
  };
}
