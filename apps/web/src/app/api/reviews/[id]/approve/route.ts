import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { videoReviews, projects } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// POST /api/reviews/:id/approve
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body.status === "changes_requested" ? "changes_requested" : "approved";

    const [updated] = await db
      .update(videoReviews)
      .set({
        status,
        approvedAt: status === "approved" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(videoReviews.id, reviewId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Video review not found" }, { status: 404 });
    }

    // If approved and linked to project, optionally sync project status
    if (status === "approved" && updated.projectId) {
      await db
        .update(projects)
        .set({ status: "delivery", updatedAt: new Date() })
        .where(eq(projects.id, updated.projectId));
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("POST approve error:", err);
    return NextResponse.json({ error: "Failed to update review status" }, { status: 500 });
  }
}
