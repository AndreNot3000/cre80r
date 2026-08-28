import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { organizations, services, galleries, videoReviews } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const showroomRoutes = factory.createApp();

// GET /api/showroom/:slug — Public Studio Showroom
showroomRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug")?.toLowerCase().trim();
  if (!slug) return c.json({ error: "Studio slug required" }, 400);

  const [foundOrg] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug));

  if (!foundOrg) {
    return c.json({
      organization: {
        id: "demo-org",
        name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Visual Studio`,
        slug: slug,
        tagline: "4K Cinematic Commercials, Luxury Weddings & Editorial Photography",
        location: "Lagos, Nigeria • London, UK",
        currency: "NGN",
      },
      services: [],
      galleries: [],
      testimonials: [],
    });
  }

  const [servicesData, galleriesData, videosData] = await Promise.all([
    db
      .select()
      .from(services)
      .where(and(eq(services.organizationId, foundOrg.id), eq(services.isActive, true)))
      .orderBy(desc(services.basePrice)),
    db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        coverPhoto: galleries.coverPhoto,
        createdAt: galleries.createdAt,
      })
      .from(galleries)
      .where(and(eq(galleries.organizationId, foundOrg.id), eq(galleries.status, "published")))
      .orderBy(desc(galleries.createdAt))
      .limit(8),
    db
      .select({
        id: videoReviews.id,
        title: videoReviews.title,
        version: videoReviews.version,
        videoUrl: videoReviews.videoUrl,
        thumbnailUrl: videoReviews.thumbnailUrl,
        durationSeconds: videoReviews.durationSeconds,
      })
      .from(videoReviews)
      .where(eq(videoReviews.organizationId, foundOrg.id))
      .orderBy(desc(videoReviews.createdAt))
      .limit(4),
  ]);

  return c.json({
    organization: foundOrg,
    services: servicesData,
    galleries: galleriesData,
    videoReviews: videosData,
  });
});
