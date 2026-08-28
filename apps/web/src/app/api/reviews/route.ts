import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { videoReviews, videoComments, projects, members, organizations } from "@crea8or/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createVideoReviewSchema } from "@crea8or/validators";

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
    } else {
      const [existingOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, session.user.id.toLowerCase().slice(0, 16)));

      if (existingOrg) {
        orgId = existingOrg.id;
      }
    }
  }

  return { user: session.user, orgId };
}

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const conditions = [eq(videoReviews.organizationId, authCtx.orgId)];
    if (projectId) {
      conditions.push(eq(videoReviews.projectId, projectId));
    }

    const result = await db
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
        commentCount: sql<number>`cast(count(${videoComments.id}) as integer)`,
      })
      .from(videoReviews)
      .leftJoin(projects, eq(videoReviews.projectId, projects.id))
      .leftJoin(videoComments, eq(videoReviews.id, videoComments.videoReviewId))
      .where(and(...conditions))
      .groupBy(videoReviews.id, projects.name)
      .orderBy(desc(videoReviews.createdAt));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch video reviews" }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createVideoReviewSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [review] = await db
      .insert(videoReviews)
      .values({
        organizationId: authCtx.orgId,
        projectId: body.projectId || null,
        title: body.title.trim(),
        version: body.version || "Cut V1",
        videoUrl: body.videoUrl.trim(),
        thumbnailUrl: body.thumbnailUrl?.trim() || null,
        durationSeconds: body.durationSeconds || 0,
        status: body.status || "in_review",
      })
      .returning();

    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to create video review" }, { status: 500 });
  }
}
