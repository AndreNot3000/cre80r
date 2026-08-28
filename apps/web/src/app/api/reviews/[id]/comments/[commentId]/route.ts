import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { videoComments } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { updateVideoCommentSchema } from "@crea8or/validators";

// PATCH /api/reviews/:id/comments/:commentId
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: reviewId, commentId } = await params;
    const json = await request.json();

    const parsed = updateVideoCommentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [updated] = await db
      .update(videoComments)
      .set({
        resolved: body.resolved !== undefined ? body.resolved : undefined,
        content: body.content !== undefined ? body.content.trim() : undefined,
      })
      .where(and(eq(videoComments.id, commentId), eq(videoComments.videoReviewId, reviewId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH comment error:", err);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

// DELETE /api/reviews/:id/comments/:commentId
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: reviewId, commentId } = await params;

    const [deleted] = await db
      .delete(videoComments)
      .where(and(eq(videoComments.id, commentId), eq(videoComments.videoReviewId, reviewId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (err: any) {
    console.error("DELETE comment error:", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
