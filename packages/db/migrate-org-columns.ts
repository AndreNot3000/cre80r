import { db } from "./src/client";
import { sql } from "drizzle-orm";

async function migrateOrgColumns() {
  await db.execute(sql`
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS location text;
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tagline text;
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS bio text;
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS instagram text;
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS whatsapp text;
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hero_showreel_url text;
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hero_poster_url text;
  `);
  console.log("✅ Organizations branding columns added successfully.");
}

migrateOrgColumns().catch(console.error);
