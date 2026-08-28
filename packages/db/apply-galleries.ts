import { db } from "./src/client";
import { sql } from "drizzle-orm";

async function applyGalleryMigration() {
  console.log("Ensuring galleries and gallery_photos tables exist in PostgreSQL...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "galleries" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
      "project_id" uuid REFERENCES "projects"("id") ON DELETE cascade,
      "client_id" uuid REFERENCES "clients"("id") ON DELETE set null,
      "title" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "cover_photo" text,
      "password" text,
      "download_pin" text,
      "watermark_enabled" boolean DEFAULT false NOT NULL,
      "allow_downloads" boolean DEFAULT true NOT NULL,
      "status" text DEFAULT 'published' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "gallery_photos" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "gallery_id" uuid NOT NULL REFERENCES "galleries"("id") ON DELETE cascade,
      "url" text NOT NULL,
      "thumbnail_url" text,
      "filename" text NOT NULL,
      "size_bytes" integer,
      "category" text DEFAULT 'Highlights',
      "exif_data" jsonb,
      "is_favorite" boolean DEFAULT false NOT NULL,
      "client_notes" text,
      "sort_order" integer DEFAULT 0,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  console.log("✅ galleries & gallery_photos tables ready!");
  process.exit(0);
}

applyGalleryMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
