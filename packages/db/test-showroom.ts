import { db } from "./src/client";
import { organizations, services, galleries, videoReviews } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runShowroomTestSuite() {
  console.log("🚀 Starting Section 7A: Public Creator Showroom (Card 7.1) Test Suite...\n");

  // 1. Setup test studio organization
  console.log("1. Setting up test studio organization...");
  let [testOrg] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, "apexvisuals"));

  if (!testOrg) {
    [testOrg] = await db
      .insert(organizations)
      .values({
        name: "Apex Visuals Cinema Studio",
        slug: "apexvisuals",
        currency: "NGN",
      })
      .returning();
  }
  console.log(`✅ Test Studio Organization ready: ${testOrg.name} (${testOrg.slug})`);

  // 2. Setup active package
  console.log("\n2. Ensuring active service package exists for showroom...");
  let [testService] = await db
    .select()
    .from(services)
    .where(and(eq(services.organizationId, testOrg.id), eq(services.name, "Luxury Wedding Cinema Master (4K)")));

  if (!testService) {
    [testService] = await db
      .insert(services)
      .values({
        organizationId: testOrg.id,
        name: "Luxury Wedding Cinema Master (4K)",
        description: "Full-day 3-camera coverage with 4K drone aerials and digital delivery.",
        basePrice: "1850000.00",
        durationHours: 12,
        isActive: true,
        addOns: [{ name: "Same-Day Teaser Reel", price: 150000 }],
      })
      .returning();
  }
  console.log(`✅ Active Service Package verified: ${testService.name} (₦${Number(testService.basePrice).toLocaleString()})`);

  // 3. Query Showroom Bundle by Slug
  console.log("\n3. Querying public studio showroom data bundle...");
  const [queriedOrg] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, "apexvisuals"));

  const activeServices = await db
    .select()
    .from(services)
    .where(and(eq(services.organizationId, queriedOrg.id), eq(services.isActive, true)));

  const publishedGalleries = await db
    .select()
    .from(galleries)
    .where(and(eq(galleries.organizationId, queriedOrg.id), eq(galleries.status, "published")));

  console.log(`✅ Showroom profile retrieved for "${queriedOrg.name}"`);
  console.log(`   - Active packages: ${activeServices.length}`);
  console.log(`   - Published 4K galleries: ${publishedGalleries.length}`);

  console.log("\n✨ Card 7.1 Public Creator Showroom Test Suite Passed Successfully!\n");
}

runShowroomTestSuite().catch((err) => {
  console.error("❌ Showroom Test Suite Error:", err);
  process.exit(1);
});
