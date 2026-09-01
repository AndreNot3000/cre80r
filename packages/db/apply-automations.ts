import { db } from "./src/client";
import { sql } from "drizzle-orm";

async function applyAutomationsMigration() {
  console.log("🚀 Applying Studio Automations & WhatsApp Engine Database Migration...");

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "automation_trigger" AS ENUM (
        'inquiry_created',
        'booking_confirmed',
        'deposit_paid',
        'callsheet_dispatched',
        'shoot_reminder_48h',
        'gallery_delivered',
        'review_cut_approved',
        'invoice_overdue'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "automation_action" AS ENUM (
        'send_whatsapp',
        'send_email',
        'notify_crew',
        'generate_callsheet',
        'create_invoice'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "automations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" text NOT NULL,
      "description" text,
      "trigger_event" "automation_trigger" NOT NULL,
      "action_type" "automation_action" NOT NULL DEFAULT 'send_whatsapp',
      "config" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "is_enabled" boolean NOT NULL DEFAULT true,
      "run_count" integer NOT NULL DEFAULT 0,
      "last_run_at" timestamp,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "automation_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "automation_id" uuid REFERENCES "automations"("id") ON DELETE CASCADE,
      "trigger_event" text NOT NULL,
      "recipient" text NOT NULL,
      "channel" text NOT NULL DEFAULT 'whatsapp',
      "status" text NOT NULL DEFAULT 'success',
      "payload" jsonb,
      "error_message" text,
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  console.log("✅ Automations tables and enums created successfully.");
}

applyAutomationsMigration().catch((err) => {
  console.error("❌ Automations Migration Error:", err);
  process.exit(1);
});
