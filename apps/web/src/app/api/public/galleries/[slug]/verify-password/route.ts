import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { galleries } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// POST /api/public/galleries/:slug/verify-password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { password } = await request.json();

    const [gallery] = await db
      .select({ password: galleries.password })
      .from(galleries)
      .where(eq(galleries.slug, slug));

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    if (!gallery.password || gallery.password.trim() === password?.trim()) {
      return NextResponse.json({ success: true, authorized: true });
    } else {
      return NextResponse.json({ error: "Incorrect gallery password" }, { status: 401 });
    }
  } catch (err: any) {
    console.error("POST verify password error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
