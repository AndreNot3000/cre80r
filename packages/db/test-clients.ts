import { db } from "./src/client";
import { clients, organizations, projects, invoices } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runClientTests() {
  console.log("🚀 Starting Client CRUD & Aggregations Test Suite...\n");

  // 1. Create or fetch a test organization
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

  // 2. Test Client Creation (POST)
  const clientName = `Luxury Client ${Date.now()}`;
  const clientEmail = `client_${Date.now()}@luxurybrand.com`;
  console.log(`\n2. Creating test client: ${clientName}...`);

  const [newClient] = await db
    .insert(clients)
    .values({
      name: clientName,
      email: clientEmail,
      phone: "+234 801 234 5678",
      instagram: "@luxurybrand_ng",
      city: "Lagos",
      country: "Nigeria",
      notes: "VIP Client for Q4 Fashion Campaign",
      tags: ["VIP", "Commercial", "Fashion"],
      organizationId: testOrg.id,
    })
    .returning();

  console.log("✅ Client created successfully:", {
    id: newClient.id,
    name: newClient.name,
    email: newClient.email,
    tags: newClient.tags,
  });

  // 3. Attach a dummy project and invoice to test financial aggregation
  console.log("\n3. Attaching dummy project and paid invoice to test lifetime spend...");
  const [dummyProject] = await db
    .insert(projects)
    .values({
      name: "Q4 Commercial Campaign Video",
      clientId: newClient.id,
      organizationId: testOrg.id,
      status: "shoot",
      budget: "2500000",
    })
    .returning();

  const [dummyInvoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber: `INV-${Date.now()}`,
      clientId: newClient.id,
      projectId: dummyProject.id,
      organizationId: testOrg.id,
      status: "paid",
      lineItems: [{ description: "Full Production Day", quantity: 1, unitPrice: 2500000, total: 2500000 }],
      subtotal: "2500000",
      total: "2500000",
      amountPaid: "2500000",
      paidAt: new Date(),
    })
    .returning();

  console.log(`✅ Attached Project (${dummyProject.name}) and Paid Invoice (₦${dummyInvoice.amountPaid})`);

  // 4. Test Single Client Retrieval with Aggregates (GET /api/clients/:id)
  console.log("\n4. Verifying Client detail retrieval and spend calculations...");
  const [fetchedClient] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, newClient.id), eq(clients.organizationId, testOrg.id)));

  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, newClient.id));

  const clientInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.clientId, newClient.id));

  const totalSpent = clientInvoices
    .filter((i) => i.status === "paid")
    .reduce((acc, curr) => acc + Number(curr.amountPaid || 0), 0);

  console.log("✅ Fetched Client Profile with Aggregates:", {
    name: fetchedClient.name,
    projectsCount: clientProjects.length,
    lifetimeSpend: `₦${totalSpent.toLocaleString()}`,
  });

  if (totalSpent !== 2500000 || clientProjects.length !== 1) {
    throw new Error("❌ Aggregation calculation mismatch!");
  }

  // 5. Test Client Update (PATCH /api/clients/:id)
  console.log("\n5. Updating client notes and tags...");
  const [updatedClient] = await db
    .update(clients)
    .set({
      notes: "Upgraded to Retainer VIP Status",
      tags: ["VIP", "Commercial", "Fashion", "Retainer"],
      updatedAt: new Date(),
    })
    .where(eq(clients.id, newClient.id))
    .returning();

  console.log("✅ Client updated successfully:", {
    notes: updatedClient.notes,
    tags: updatedClient.tags,
  });

  // 6. Test Soft Delete (DELETE /api/clients/:id)
  console.log("\n6. Testing soft-delete (archiving client)...");
  const [archivedClient] = await db
    .update(clients)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, newClient.id))
    .returning();

  console.log("✅ Client archived status (isArchived):", archivedClient.isArchived);

  // Verify archived client is omitted from active list query
  const activeClients = await db
    .select()
    .from(clients)
    .where(and(eq(clients.organizationId, testOrg.id), eq(clients.isArchived, false), eq(clients.id, newClient.id)));

  if (activeClients.length === 0) {
    console.log("✅ Verified: Archived client is excluded from active client queries.");
  } else {
    throw new Error("❌ Error: Archived client still appeared in active query!");
  }

  console.log("\n✨ All Card 2.1 Database & CRUD Tests Passed Successfully!");
  process.exit(0);
}

runClientTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
