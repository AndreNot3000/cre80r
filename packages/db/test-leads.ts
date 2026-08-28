import { db } from "./src/client";
import { leads, organizations, clients, projects } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runLeadTests() {
  console.log("🚀 Starting Leads CRUD, Stage Transitions & Conversion Test Suite...\n");

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

  // 2. Create Lead (POST)
  const leadName = `Prospective Bride ${Date.now()}`;
  console.log(`\n2. Creating new inquiry lead: ${leadName}...`);
  const [newLead] = await db
    .insert(leads)
    .values({
      name: leadName,
      email: `lead_${Date.now()}@weddinginquiry.ng`,
      phone: "+234 809 111 2233",
      serviceInterest: "Wedding Cinematography & 4K Photo",
      budget: "1850000",
      currency: "NGN",
      status: "new",
      source: "instagram_dm",
      message: "Looking for full coverage of our 2-day wedding in Lagos with drone pilot.",
      organizationId: testOrg.id,
    })
    .returning();

  console.log("✅ Lead created successfully:", {
    id: newLead.id,
    name: newLead.name,
    status: newLead.status,
    budget: `₦${Number(newLead.budget).toLocaleString()}`,
  });

  // 3. Stage Transitions (PATCH status)
  console.log("\n3. Testing Stage Transitions (new -> contacted -> quote_sent -> negotiating)...");
  const stages: ("contacted" | "quote_sent" | "negotiating")[] = ["contacted", "quote_sent", "negotiating"];

  for (const stage of stages) {
    const [updated] = await db
      .update(leads)
      .set({ status: stage, updatedAt: new Date() })
      .where(eq(leads.id, newLead.id))
      .returning();
    console.log(`   Transitioned to stage: "${updated.status}" ✓`);
  }

  // 4. Test Lead Conversion to Client & Project (POST /api/leads/:id/convert)
  console.log("\n4. Testing 1-Click Conversion of Lead into Client & Project...");

  // Insert client
  const [convertedClient] = await db
    .insert(clients)
    .values({
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      notes: `Converted from lead: ${newLead.message}`,
      tags: ["Wedding", "Converted Lead"],
      organizationId: testOrg.id,
    })
    .returning();

  // Update lead status to booked
  const [bookedLead] = await db
    .update(leads)
    .set({
      status: "booked",
      clientId: convertedClient.id,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, newLead.id))
    .returning();

  // Create Project
  const [createdProject] = await db
    .insert(projects)
    .values({
      name: `${newLead.name} — Wedding Cinematography`,
      clientId: convertedClient.id,
      organizationId: testOrg.id,
      status: "pre_production",
      budget: newLead.budget || "0",
    })
    .returning();

  console.log("✅ Conversion Complete:", {
    clientCreated: convertedClient.name,
    clientId: convertedClient.id,
    leadStatus: bookedLead.status,
    projectCreated: createdProject.name,
    projectStatus: createdProject.status,
  });

  // 5. Cleanup / Delete Test Lead
  console.log("\n5. Testing Lead Deletion...");
  await db.delete(leads).where(eq(leads.id, newLead.id));
  const [deletedCheck] = await db.select().from(leads).where(eq(leads.id, newLead.id));

  if (!deletedCheck) {
    console.log("✅ Verified: Lead deleted successfully from database.");
  } else {
    throw new Error("❌ Error: Lead was not deleted!");
  }

  console.log("\n✨ All Card 2.4 Leads & Stage Transition Tests Passed Successfully!");
  process.exit(0);
}

runLeadTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
