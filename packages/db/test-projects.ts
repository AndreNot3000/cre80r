import { db } from "./src/client";
import { projects, clients, organizations } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runProjectsTests() {
  console.log("🚀 Starting Projects Schema & Multi-Stage Lifecycle Test Suite...\n");

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

  // 2. Setup test client
  console.log("2. Setting up test client...");
  let [testClient] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.name, "Ade & Tolu Wedding"), eq(clients.organizationId, testOrg.id)));

  if (!testClient) {
    [testClient] = await db
      .insert(clients)
      .values({
        name: "Ade & Tolu Wedding",
        email: "adeandtolu@wedding.ng",
        phone: "+234 802 999 8888",
        city: "Lagos",
        organizationId: testOrg.id,
      })
      .returning();
  }
  console.log(`✅ Test Client ready: ${testClient.name} (${testClient.id})`);

  // 3. Create Project
  const shootDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const deliveryDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

  console.log("\n3. Creating new creative production project...");
  const [newProject] = await db
    .insert(projects)
    .values({
      name: "Ade & Tolu Luxury Wedding Cinema Film",
      description: "Full-day wedding cinema production at Landmark Event Centre, Lagos with dual 4K cameras and aerial drone.",
      clientId: testClient.id,
      organizationId: testOrg.id,
      status: "pre_production",
      shootDate,
      deliveryDate,
      notes: "Call time 07:00 AM. Drone clearance permit approved by venue.",
    })
    .returning();

  console.log("✅ Project created successfully:", {
    id: newProject.id,
    name: newProject.name,
    status: newProject.status,
    shootDate: newProject.shootDate,
    deliveryDate: newProject.deliveryDate,
  });

  // 4. Test Stage Advancement
  const stages: ("shoot" | "editing" | "client_review" | "delivery" | "completed")[] = [
    "shoot",
    "editing",
    "client_review",
    "delivery",
    "completed",
  ];

  console.log("\n4. Testing multi-stage lifecycle progression...");
  for (const stage of stages) {
    const [updated] = await db
      .update(projects)
      .set({ status: stage, updatedAt: new Date() })
      .where(eq(projects.id, newProject.id))
      .returning();

    console.log(`  ↪ Transitioned to stage: "${updated.status}"`);
  }

  // 5. Cleanup
  console.log("\n5. Cleaning up test project...");
  await db.delete(projects).where(eq(projects.id, newProject.id));
  const [deletedCheck] = await db.select().from(projects).where(eq(projects.id, newProject.id));

  if (!deletedCheck) {
    console.log("✅ Verified: Test project cleaned up successfully.");
  } else {
    throw new Error("❌ Error: Test project was not deleted!");
  }

  console.log("\n✨ All Card 4.1 Projects Schema & Lifecycle Tests Passed Successfully!");
  process.exit(0);
}

runProjectsTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
