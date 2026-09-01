import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { automationLogs } from "@crea8or/db/schema";
import { sql } from "drizzle-orm";

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "crea8or_whatsapp_verify_token_2026";

// GET /api/webhooks/whatsapp — Meta Webhook Verification Challenge
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ WhatsApp Webhook Verified with Meta Cloud API.");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden: Invalid verify token" }, { status: 403 });
}

// POST /api/webhooks/whatsapp — Meta Webhook Event Handler (Delivery status & inbound messages)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse WhatsApp statuses
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.statuses && Array.isArray(value.statuses)) {
      for (const statusObj of value.statuses) {
        const waMessageId = statusObj.id;
        const status = statusObj.status; // "sent" | "delivered" | "read" | "failed"
        const recipientId = statusObj.recipient_id;

        console.log(`📡 WhatsApp Status Update: Message ${waMessageId} ➔ ${status.toUpperCase()} (${recipientId})`);

        // Update matching log entry in PostgreSQL
        await db.execute(sql`
          UPDATE "automation_logs"
          SET "status" = ${status === "read" || status === "delivered" ? "delivered" : status}
          WHERE "payload"->>'waMessageId' = ${waMessageId}
        `);
      }
    }

    return NextResponse.json({ status: "success", received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
