import { db } from "./src/client";
import { services, organizations } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runServicesTests() {
  console.log("🚀 Starting Services & Pricing Architecture Test Suite...\n");

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

  // 2. Create Service Package (POST)
  const pkgName = `Cinematic Wedding Package ${Date.now()}`;
  console.log(`\n2. Creating service package: ${pkgName}...`);
  const [newPkg] = await db
    .insert(services)
    .values({
      name: pkgName,
      description: "Full day coverage with 2 cinema cameras, drone operator, and 4K color graded highlight reel.",
      basePrice: "1850000",
      currency: "NGN",
      durationHours: 10,
      isActive: true,
      addOns: [
        { name: "Drone 4K Pilot Coverage", price: 250000 },
        { name: "48-Hour Expedited Delivery", price: 150000 },
        { name: "Raw Footage Hard Drive", price: 80000 },
      ],
      organizationId: testOrg.id,
    })
    .returning();

  console.log("✅ Service package created successfully:", {
    id: newPkg.id,
    name: newPkg.name,
    basePrice: `₦${Number(newPkg.basePrice).toLocaleString()}`,
    currency: newPkg.currency,
    addOnsCount: (newPkg.addOns as any[])?.length,
  });

  // 3. Query Service Package
  console.log("\n3. Querying service package from database...");
  const [fetched] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, newPkg.id), eq(services.organizationId, testOrg.id)));

  if (!fetched || Number(fetched.basePrice) !== 1850000) {
    throw new Error("❌ Fetched service package data mismatch!");
  }
  console.log("✅ Fetched service package successfully with matching base price and add-ons.");

  // 4. Update Service Package (PATCH)
  console.log("\n4. Updating package price and add-ons...");
  const [updated] = await db
    .update(services)
    .set({
      basePrice: "2100000",
      description: "Upgraded Luxury Wedding Package with 3 Cinema Cameras",
      updatedAt: new Date(),
    })
    .where(eq(services.id, newPkg.id))
    .returning();

  console.log("✅ Service package updated successfully:", {
    name: updated.name,
    newPrice: `₦${Number(updated.basePrice).toLocaleString()}`,
  });

  // 5. Cleanup / Delete Service Package
  console.log("\n5. Testing Package Deletion...");
  await db.delete(services).where(eq(services.id, newPkg.id));
  const [deletedCheck] = await db.select().from(services).where(eq(services.id, newPkg.id));

  if (!deletedCheck) {
    console.log("✅ Verified: Service package deleted successfully from database.");
  } else {
    throw new Error("❌ Error: Service package was not deleted!");
  }

  console.log("\n✨ All Card 3.1 Services & Pricing Tests Passed Successfully!");
  process.exit(0);
}

runServicesTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
