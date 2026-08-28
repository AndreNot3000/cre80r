import { db } from "./src/client";
import { videoReviews, videoComments, projects, organizations } from "./src/schema";
import { eq, asc } from "drizzle-orm";

async function runVideoReviewsTests() {
  console.log("🚀 Starting Section 5B: Frame-Accurate Video Review & Feedback Engine Test Suite...\n");

  // 1. Setup test organization
  console.log("1. Setting up test organization...");
  let [testOrg] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, "test-studio-crm"));

  if (!testOrg) {
    [testOrg] = await db
      .insert(organizations)
      .values({
        name: "Test CRM Creative Studio",
        slug: "test-studio-crm",
        currency: "NGN",
      })
      .returning();
  }
  console.log(`✅ Test Organization ready: ${testOrg.name} (${testOrg.id})`);

  // 2. Setup test project
  console.log("2. Setting up test project...");
  const [testProject] = await db
    .insert(projects)
    .values({
      organizationId: testOrg.id,
      name: "Guinness African Heritage Commercial 2026",
      status: "client_review",
    })
    .returning();
  console.log(`✅ Test Project created: ${testProject.name} (${testProject.id})`);

  // 3. Create Video Review Cut
  console.log("\n3. Creating Video Review cut (Cut V2 ProRes 4K)...");
  const [newReview] = await db
    .insert(videoReviews)
    .values({
      organizationId: testOrg.id,
      projectId: testProject.id,
      title: "Guinness Commercial 60s Director Cut",
      version: "Cut V2",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      durationSeconds: 60,
      status: "in_review",
    })
    .returning();

  console.log("✅ Video Review record created:", {
    id: newReview.id,
    title: newReview.title,
    version: newReview.version,
    status: newReview.status,
  });

  // 4. Add Frame-Accurate Timestamped Comments
  console.log("\n4. Ingesting timestamped feedback comments...");
  const sampleComments = [
    {
      videoReviewId: newReview.id,
      timestampSeconds: 4,
      timecode: "00:04:06",
      authorName: "Kolawole (Brand Director)",
      authorRole: "client" as const,
      content: "Please punch in slightly on the hero product reveal bottle close-up.",
      resolved: false,
    },
    {
      videoReviewId: newReview.id,
      timestampSeconds: 12,
      timecode: "00:12:18",
      authorName: "Emeka (Lead Colorist)",
      authorRole: "creator" as const,
      content: "ACES color pipeline applied; highlight rolloff matched to cinema print.",
      resolved: true,
    },
  ];

  const insertedComments = await db.insert(videoComments).values(sampleComments).returning();
  console.log(`✅ ${insertedComments.length} Timestamped comments saved to thread.`);

  // 5. Test Resolve / Reopen Comment Toggle
  console.log("\n5. Testing comment resolution toggle...");
  const [updatedComment] = await db
    .update(videoComments)
    .set({ resolved: true })
    .where(eq(videoComments.id, insertedComments[0]!.id))
    .returning();

  console.log(`✅ Comment resolved state updated: resolved=${updatedComment.resolved}`);

  // 6. Test 1-Click Cut Approval
  console.log("\n6. Testing 1-click Cut Approval...");
  const [approvedReview] = await db
    .update(videoReviews)
    .set({
      status: "approved",
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(videoReviews.id, newReview.id))
    .returning();

  console.log("✅ Video Cut Approved by Client:", {
    status: approvedReview.status,
    approvedAt: approvedReview.approvedAt,
  });

  // 7. Cleanup
  console.log("\n7. Cleaning up test review and project...");
  await db.delete(videoComments).where(eq(videoComments.videoReviewId, newReview.id));
  await db.delete(videoReviews).where(eq(videoReviews.id, newReview.id));
  await db.delete(projects).where(eq(projects.id, testProject.id));
  console.log("✅ Cleanup complete.");

  console.log("\n✨ All Section 5B Video Review & Feedback Tests Passed Successfully!");
  process.exit(0);
}

runVideoReviewsTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
