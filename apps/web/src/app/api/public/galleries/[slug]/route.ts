import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { galleries, galleryPhotos, clients, organizations, projects } from "@crea8or/db/schema";
import { eq, and, asc } from "drizzle-orm";

// GET /api/public/galleries/:slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [gallery] = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        coverPhoto: galleries.coverPhoto,
        hasPassword: galleries.password,
        hasDownloadPin: galleries.downloadPin,
        watermarkEnabled: galleries.watermarkEnabled,
        allowDownloads: galleries.allowDownloads,
        status: galleries.status,
        createdAt: galleries.createdAt,
        clientName: clients.name,
        projectName: projects.name,
        orgName: organizations.name,
        orgSlug: organizations.slug,
      })
      .from(galleries)
      .leftJoin(clients, eq(galleries.clientId, clients.id))
      .leftJoin(projects, eq(galleries.projectId, projects.id))
      .leftJoin(organizations, eq(galleries.organizationId, organizations.id))
      .where(eq(galleries.slug, slug));

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const photos = await db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.galleryId, gallery.id))
      .orderBy(asc(galleryPhotos.sortOrder), asc(galleryPhotos.createdAt));

    // Return sanitized gallery data (masking actual password/PIN from initial payload)
    return NextResponse.json({
      gallery: {
        ...gallery,
        hasPassword: !!gallery.hasPassword,
        hasDownloadPin: !!gallery.hasDownloadPin,
      },
      photos,
    });
  } catch (err: any) {
    console.error("GET /api/public/galleries/:slug error:", err);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
  }
}
