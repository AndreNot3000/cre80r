import { db } from "./src/client";
import { sql } from "drizzle-orm";

async function applyMigration() {
  console.log("Applying call_sheets table migration...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "call_sheets" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
      "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
      "title" text NOT NULL,
      "shoot_date" timestamp NOT NULL,
      "general_call_time" text NOT NULL,
      "location_name" text NOT NULL,
      "location_address" text,
      "location_maps_url" text,
      "parking_notes" text,
      "weather_forecast" text,
      "nearest_hospital" text,
      "crew" jsonb NOT NULL,
      "schedule" jsonb NOT NULL,
      "gear_list" jsonb,
      "emergency_contacts" jsonb,
      "notes" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  console.log("✅ call_sheets table created successfully!");
  process.exit(0);
}

applyMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
