import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { galleries, galleryPhotos } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const galleryRoutes = factory.createApp();

const createGallerySchema = z.object({
  title: z.string().min(2, "Gallery title is required"),
  slug: z.string().min(2).optional(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  coverPhoto: z.string().optional(),
  password: z.string().optional(),
  downloadPin: z.string().optional(),
  watermarkEnabled: z.boolean().default(false),
  allowDownloads: z.boolean().default(true),
});

// GET /api/galleries (List all for studio)
galleryRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const result = await db
    .select()
    .from(galleries)
    .where(eq(galleries.organizationId, org.id))
    .orderBy(desc(galleries.createdAt));
  return c.json(result);
});

// POST /api/galleries (Create new gallery)
galleryRoutes.post("/", requireAuth, zValidator("json", createGallerySchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");
  const autoSlug =
    body.slug ||
    body.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") + `-${Date.now()}`;

  const [gallery] = await db
    .insert(galleries)
    .values({
      title: body.title,
      slug: autoSlug,
      projectId: body.projectId || null,
      clientId: body.clientId || null,
      coverPhoto: body.coverPhoto || null,
      password: body.password || null,
      downloadPin: body.downloadPin || null,
      watermarkEnabled: body.watermarkEnabled,
      allowDownloads: body.allowDownloads,
      organizationId: org.id,
    })
    .returning();

  return c.json(gallery, 201);
});

// GET /api/galleries/:id (Get gallery with photos)
galleryRoutes.get("/:id", async (c) => {
  const [gallery] = await db
    .select()
    .from(galleries)
    .where(eq(galleries.id, c.req.param("id") as string));

  if (!gallery) return c.json({ error: "Gallery not found" }, 404);

  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.galleryId, gallery.id))
    .orderBy(galleryPhotos.sortOrder);

  return c.json({ ...gallery, photos });
});

// POST /api/galleries/:id/photos (Upload photo metadata)
galleryRoutes.post(
  "/:id/photos",
  requireAuth,
  zValidator(
    "json",
    z.object({
      url: z.string().url(),
      thumbnailUrl: z.string().optional(),
      filename: z.string(),
      sizeBytes: z.number().optional(),
      category: z.string().default("Highlights"),
      exifData: z.record(z.any()).optional(),
    })
  ),
  async (c) => {
    const body = c.req.valid("json");
    const [photo] = await db
      .insert(galleryPhotos)
      .values({
        galleryId: c.req.param("id") as string,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl || null,
        filename: body.filename,
        sizeBytes: body.sizeBytes || null,
        category: body.category,
        exifData: body.exifData || null,
      })
      .returning();

    return c.json(photo, 201);
  }
);

// POST /api/galleries/photos/:photoId/favorite (Toggle favorite)
galleryRoutes.post("/photos/:photoId/favorite", async (c) => {
  const [photo] = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.id, c.req.param("photoId") as string));

  if (!photo) return c.json({ error: "Photo not found" }, 404);

  const [updated] = await db
    .update(galleryPhotos)
    .set({ isFavorite: !photo.isFavorite })
    .where(eq(galleryPhotos.id, photo.id))
    .returning();

  return c.json(updated);
});
