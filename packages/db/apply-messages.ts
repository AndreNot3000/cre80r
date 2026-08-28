import { db } from "./src/client";
import { sql } from "drizzle-orm";

async function applyMigration() {
  console.log("Applying messages table migration...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
      "project_id" uuid REFERENCES "projects"("id") ON DELETE cascade,
      "client_id" uuid REFERENCES "clients"("id") ON DELETE cascade,
      "sender_id" text,
      "sender_name" text NOT NULL,
      "sender_role" text DEFAULT 'creator' NOT NULL,
      "sender_avatar" text,
      "content" text NOT NULL,
      "attachments" jsonb,
      "is_read" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  console.log("✅ messages table created successfully!");
  process.exit(0);
}

applyMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
