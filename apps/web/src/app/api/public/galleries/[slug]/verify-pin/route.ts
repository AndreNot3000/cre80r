import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { galleries } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// POST /api/public/galleries/:slug/verify-pin
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { pin } = await request.json();

    const [gallery] = await db
      .select({ downloadPin: galleries.downloadPin, allowDownloads: galleries.allowDownloads })
      .from(galleries)
      .where(eq(galleries.slug, slug));

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    if (!gallery.allowDownloads) {
      return NextResponse.json({ error: "Downloads have been disabled for this gallery" }, { status: 403 });
    }

    if (!gallery.downloadPin || gallery.downloadPin.trim() === pin?.trim()) {
      return NextResponse.json({ success: true, authorized: true });
    } else {
      return NextResponse.json({ error: "Incorrect 4-digit download PIN" }, { status: 401 });
    }
  } catch (err: any) {
    console.error("POST verify pin error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
