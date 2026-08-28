import { db } from "./src/client";
import { sql } from "drizzle-orm";

async function applyReviewsMigration() {
  console.log("Ensuring video_reviews and video_comments tables exist in PostgreSQL...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "video_reviews" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
      "project_id" uuid REFERENCES "projects"("id") ON DELETE cascade,
      "title" text NOT NULL,
      "version" text DEFAULT 'Cut V1' NOT NULL,
      "video_url" text NOT NULL,
      "thumbnail_url" text,
      "duration_seconds" integer DEFAULT 0,
      "status" text DEFAULT 'in_review' NOT NULL,
      "approved_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "video_comments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "video_review_id" uuid NOT NULL REFERENCES "video_reviews"("id") ON DELETE cascade,
      "timestamp_seconds" integer NOT NULL,
      "timecode" text NOT NULL,
      "author_name" text NOT NULL,
      "author_role" text DEFAULT 'client' NOT NULL,
      "content" text NOT NULL,
      "resolved" boolean DEFAULT false NOT NULL,
      "drawing_data" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  console.log("✅ video_reviews and video_comments tables ready!");
  process.exit(0);
}

applyReviewsMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
