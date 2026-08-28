import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { videoReviews, videoComments } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const reviewRoutes = factory.createApp();

const createReviewSchema = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().min(2, "Review title is required"),
  version: z.string().default("Cut V1"),
  videoUrl: z.string().url("Valid video URL is required"),
  thumbnailUrl: z.string().optional(),
  durationSeconds: z.number().default(0),
});

const createCommentSchema = z.object({
  timestampSeconds: z.number().nonnegative(),
  timecode: z.string(),
  authorName: z.string().min(1),
  authorRole: z.enum(["client", "creator", "editor"]).default("client"),
  content: z.string().min(1, "Comment text is required"),
  drawingData: z.record(z.any()).optional(),
});

// GET /api/reviews (List all video reviews for studio)
reviewRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const result = await db
    .select()
    .from(videoReviews)
    .where(eq(videoReviews.organizationId, org.id))
    .orderBy(desc(videoReviews.createdAt));
  return c.json(result);
});

// POST /api/reviews (Create new video review cut)
reviewRoutes.post("/", requireAuth, zValidator("json", createReviewSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");

  const [review] = await db
    .insert(videoReviews)
    .values({
      title: body.title,
      version: body.version,
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl || null,
      durationSeconds: body.durationSeconds,
      projectId: body.projectId || null,
      organizationId: org.id,
    })
    .returning();

  return c.json(review, 201);
});

// GET /api/reviews/:id (Get review cut with comments thread)
reviewRoutes.get("/:id", async (c) => {
  const [review] = await db
    .select()
    .from(videoReviews)
    .where(eq(videoReviews.id, c.req.param("id") as string));

  if (!review) return c.json({ error: "Video review not found" }, 404);

  const comments = await db
    .select()
    .from(videoComments)
    .where(eq(videoComments.videoReviewId, review.id))
    .orderBy(videoComments.timestampSeconds);

  return c.json({ ...review, comments });
});

// POST /api/reviews/:id/comments (Add timestamped comment)
reviewRoutes.post("/:id/comments", zValidator("json", createCommentSchema), async (c) => {
  const body = c.req.valid("json");

  const [comment] = await db
    .insert(videoComments)
    .values({
      videoReviewId: c.req.param("id") as string,
      timestampSeconds: body.timestampSeconds,
      timecode: body.timecode,
      authorName: body.authorName,
      authorRole: body.authorRole,
      content: body.content,
      drawingData: body.drawingData || null,
    })
    .returning();

  return c.json(comment, 201);
});

// POST /api/reviews/:id/approve (Client approval)
reviewRoutes.post("/:id/approve", async (c) => {
  const [updated] = await db
    .update(videoReviews)
    .set({
      status: "approved",
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(videoReviews.id, c.req.param("id") as string))
    .returning();

  if (!updated) return c.json({ error: "Video review not found" }, 404);
  return c.json(updated);
});
