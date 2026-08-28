import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { videoComments, videoReviews } from "@crea8or/db/schema";
import { eq, asc } from "drizzle-orm";
import { createVideoCommentSchema } from "@crea8or/validators";

// GET /api/reviews/:id/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;

    const comments = await db
      .select()
      .from(videoComments)
      .where(eq(videoComments.videoReviewId, reviewId))
      .orderBy(asc(videoComments.timestampSeconds), asc(videoComments.createdAt));

    return NextResponse.json(comments);
  } catch (err: any) {
    console.error("GET comments error:", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/reviews/:id/comments — Add frame-accurate timestamped comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const json = await request.json();

    const parsed = createVideoCommentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    // Verify video review exists
    const [review] = await db
      .select({ id: videoReviews.id })
      .from(videoReviews)
      .where(eq(videoReviews.id, reviewId));

    if (!review) {
      return NextResponse.json({ error: "Video review not found" }, { status: 404 });
    }

    const [comment] = await db
      .insert(videoComments)
      .values({
        videoReviewId: reviewId,
        timestampSeconds: Math.floor(body.timestampSeconds),
        timecode: body.timecode,
        authorName: body.authorName.trim(),
        authorRole: body.authorRole || "client",
        content: body.content.trim(),
        drawingData: body.drawingData || null,
        resolved: false,
      })
      .returning();

    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    console.error("POST comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
