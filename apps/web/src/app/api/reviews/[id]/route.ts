import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { videoReviews, videoComments, projects, members } from "@crea8or/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { updateVideoReviewSchema } from "@crea8or/validators";

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

// GET /api/reviews/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: reviewId } = await params;

    const [review] = await db
      .select({
        id: videoReviews.id,
        title: videoReviews.title,
        version: videoReviews.version,
        videoUrl: videoReviews.videoUrl,
        thumbnailUrl: videoReviews.thumbnailUrl,
        durationSeconds: videoReviews.durationSeconds,
        status: videoReviews.status,
        approvedAt: videoReviews.approvedAt,
        createdAt: videoReviews.createdAt,
        updatedAt: videoReviews.updatedAt,
        projectId: videoReviews.projectId,
        projectName: projects.name,
      })
      .from(videoReviews)
      .leftJoin(projects, eq(videoReviews.projectId, projects.id))
      .where(and(eq(videoReviews.organizationId, authCtx.orgId), eq(videoReviews.id, reviewId)));

    if (!review) {
      return NextResponse.json({ error: "Video review not found" }, { status: 404 });
    }

    const comments = await db
      .select()
      .from(videoComments)
      .where(eq(videoComments.videoReviewId, reviewId))
      .orderBy(asc(videoComments.timestampSeconds), asc(videoComments.createdAt));

    return NextResponse.json({ ...review, comments });
  } catch (err: any) {
    console.error("GET /api/reviews/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch video review" }, { status: 500 });
  }
}

// PATCH /api/reviews/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: reviewId } = await params;
    const json = await request.json();
    const parsed = updateVideoReviewSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [updated] = await db
      .update(videoReviews)
      .set({
        title: body.title !== undefined ? body.title.trim() : undefined,
        version: body.version !== undefined ? body.version.trim() : undefined,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl.trim() : undefined,
        thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl?.trim() || null : undefined,
        durationSeconds: body.durationSeconds !== undefined ? body.durationSeconds : undefined,
        status: body.status !== undefined ? body.status : undefined,
        approvedAt: body.approvedAt ? new Date(body.approvedAt) : undefined,
        projectId: body.projectId !== undefined ? body.projectId : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(videoReviews.organizationId, authCtx.orgId), eq(videoReviews.id, reviewId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Video review not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/reviews/:id error:", err);
    return NextResponse.json({ error: "Failed to update video review" }, { status: 500 });
  }
}

// DELETE /api/reviews/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: reviewId } = await params;

    const [deleted] = await db
      .delete(videoReviews)
      .where(and(eq(videoReviews.organizationId, authCtx.orgId), eq(videoReviews.id, reviewId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Video review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Video review deleted" });
  } catch (err: any) {
    console.error("DELETE /api/reviews/:id error:", err);
    return NextResponse.json({ error: "Failed to delete video review" }, { status: 500 });
  }
}
