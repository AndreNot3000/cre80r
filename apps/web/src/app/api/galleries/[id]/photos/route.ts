import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { galleryPhotos, galleries, members } from "@crea8or/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { uploadGalleryPhotoSchema } from "@crea8or/validators";
import { z } from "zod";

async function getAuthContext() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  let orgId = (session.session as any)?.activeOrganizationId || (session.user as any)?.organizationId;

  if (!orgId) {
    const [membership] = await db
      .select()
      .from(members)
      .where(eq(members.userId, session.user.id));

    if (membership) {
      orgId = membership.organizationId;
    }
  }

  return { user: session.user, orgId };
}

// GET /api/galleries/:id/photos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: galleryId } = await params;

    const photos = await db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.galleryId, galleryId))
      .orderBy(asc(galleryPhotos.sortOrder), asc(galleryPhotos.createdAt));

    return NextResponse.json(photos);
  } catch (err: any) {
    console.error("GET /api/galleries/:id/photos error:", err);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

// POST /api/galleries/:id/photos — Upload/Record photo metadata (single or array)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: galleryId } = await params;
    const json = await request.json();

    // Verify gallery belongs to org
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(and(eq(galleries.organizationId, authCtx.orgId), eq(galleries.id, galleryId)));

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Support single item or batch array
    if (Array.isArray(json)) {
      const itemsToInsert = json.map((item, index) => ({
        galleryId,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        filename: item.filename || `Photo_${Date.now()}_${index + 1}.jpg`,
        sizeBytes: item.sizeBytes || null,
        category: item.category || "Highlights",
        exifData: item.exifData || null,
        sortOrder: index,
      }));

      const inserted = await db.insert(galleryPhotos).values(itemsToInsert).returning();

      // If gallery has no cover photo, set the first photo as cover
      if (!gallery.coverPhoto && inserted.length > 0) {
        await db
          .update(galleries)
          .set({ coverPhoto: inserted[0]!.url })
          .where(eq(galleries.id, galleryId));
      }

      return NextResponse.json(inserted, { status: 201 });
    } else {
      const parsed = uploadGalleryPhotoSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
      }

      const body = parsed.data;
      const [photo] = await db
        .insert(galleryPhotos)
        .values({
          galleryId,
          url: body.url,
          thumbnailUrl: body.thumbnailUrl || body.url,
          filename: body.filename,
          sizeBytes: body.sizeBytes || null,
          category: body.category,
          exifData: body.exifData || null,
        })
        .returning();

      if (!gallery.coverPhoto) {
        await db
          .update(galleries)
          .set({ coverPhoto: photo.url })
          .where(eq(galleries.id, galleryId));
      }

      return NextResponse.json(photo, { status: 201 });
    }
  } catch (err: any) {
    console.error("POST /api/galleries/:id/photos error:", err);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
