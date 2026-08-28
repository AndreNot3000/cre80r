import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { videoReviews, videoComments, projects, organizations } from "@crea8or/db/schema";
import { eq, asc } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEMO_REVIEW = {
  id: "demo-lookbook",
  title: "Kolawole Luxury Lookbook Q3 — Commercial Film",
  version: "Cut V2",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumbnailUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200",
  durationSeconds: 60,
  status: "in_review" as const,
  approvedAt: null,
  createdAt: new Date().toISOString(),
  projectId: null,
  projectName: "Kolawole Luxury Lookbook",
  orgName: "Apex Visuals Studio",
};

const DEMO_COMMENTS = [
  {
    id: "c-demo-1",
    videoReviewId: "demo-lookbook",
    timestampSeconds: 5,
    timecode: "00:05:00",
    authorName: "Tolulope (Client Lead)",
    authorRole: "client" as const,
    content: "Can we extend this opening establishing shot by 2 more seconds for brand logo lockup?",
    resolved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-demo-2",
    videoReviewId: "demo-lookbook",
    timestampSeconds: 18,
    timecode: "00:18:12",
    authorName: "Adeola (Lead Director)",
    authorRole: "creator" as const,
    content: "ACES color pipeline applied; cinematic warm highlight rolloff is calibrated for 4K HDR.",
    resolved: false,
    createdAt: new Date().toISOString(),
  },
];

// GET /api/public/reviews/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Handle demo-lookbook slug or non-UUID queries gracefully
    if (!UUID_REGEX.test(id)) {
      if (id === "demo-lookbook" || id.startsWith("demo")) {
        return NextResponse.json({ review: DEMO_REVIEW, comments: DEMO_COMMENTS });
      }
      return NextResponse.json({ error: "Invalid review ID format" }, { status: 404 });
    }

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
        projectId: videoReviews.projectId,
        projectName: projects.name,
        orgName: organizations.name,
      })
      .from(videoReviews)
      .leftJoin(projects, eq(videoReviews.projectId, projects.id))
      .leftJoin(organizations, eq(videoReviews.organizationId, organizations.id))
      .where(eq(videoReviews.id, id));

    if (!review) {
      return NextResponse.json({ error: "Video review not found" }, { status: 404 });
    }

    const comments = await db
      .select()
      .from(videoComments)
      .where(eq(videoComments.videoReviewId, review.id))
      .orderBy(asc(videoComments.timestampSeconds), asc(videoComments.createdAt));

    return NextResponse.json({ review, comments });
  } catch (err: any) {
    console.error("GET public review error:", err);
    return NextResponse.json({ error: "Failed to load video review" }, { status: 500 });
  }
}
