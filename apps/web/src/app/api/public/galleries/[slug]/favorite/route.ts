import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { galleryPhotos, galleries } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/public/galleries/:slug/favorite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { photoId, isFavorite, clientNotes } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const [gallery] = await db
      .select({ id: galleries.id })
      .from(galleries)
      .where(eq(galleries.slug, slug));

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const [updatedPhoto] = await db
      .update(galleryPhotos)
      .set({
        isFavorite: isFavorite !== undefined ? isFavorite : undefined,
        clientNotes: clientNotes !== undefined ? clientNotes : undefined,
      })
      .where(and(eq(galleryPhotos.id, photoId), eq(galleryPhotos.galleryId, gallery.id)))
      .returning();

    if (!updatedPhoto) {
      return NextResponse.json({ error: "Photo not found in this gallery" }, { status: 404 });
    }

    return NextResponse.json(updatedPhoto);
  } catch (err: any) {
    console.error("POST favorite error:", err);
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
  }
}
