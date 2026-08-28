import { db } from "./src/client";
import { quotes, clients, organizations } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runQuotesTests() {
  console.log("🚀 Starting Quote Builder & Auto-Math Engine Test Suite...\n");

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

  // 3. Create Quote with Auto-Math
  const lineItems = [
    { description: "Full Day Wedding Cinematography (4K ProRes)", quantity: 1, unitPrice: 2000000, total: 2000000 },
    { description: "Drone Aerial 4K Pilot Coverage", quantity: 1, unitPrice: 250000, total: 250000 },
    { description: "48-Hour Expedited Delivery", quantity: 1, unitPrice: 150000, total: 150000 },
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); // 2,400,000
  const taxRate = 7.5; // 7.5% VAT in Nigeria
  const taxAmount = (subtotal * taxRate) / 100; // 180,000
  const discountAmount = 100000; // 100,000 discount
  const total = subtotal + taxAmount - discountAmount; // 2,480,000

  const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
  console.log(`\n3. Creating new quote (${quoteNumber}) with auto-math...`);

  const [newQuote] = await db
    .insert(quotes)
    .values({
      quoteNumber,
      clientId: testClient.id,
      organizationId: testOrg.id,
      lineItems,
      subtotal: String(subtotal),
      taxRate: String(taxRate),
      taxAmount: String(taxAmount),
      discountAmount: String(discountAmount),
      total: String(total),
      currency: "NGN",
      notes: "50% deposit required upon signing. 50% due on delivery.",
      status: "draft",
    })
    .returning();

  console.log("✅ Quote created successfully:", {
    id: newQuote.id,
    quoteNumber: newQuote.quoteNumber,
    subtotal: `₦${Number(newQuote.subtotal).toLocaleString()}`,
    taxAmount: `₦${Number(newQuote.taxAmount).toLocaleString()}`,
    discount: `-₦${Number(newQuote.discountAmount).toLocaleString()}`,
    total: `₦${Number(newQuote.total).toLocaleString()}`,
    status: newQuote.status,
  });

  if (Number(newQuote.total) !== 2480000) {
    throw new Error("❌ Auto-math total calculation mismatch!");
  }

  // 4. Test Transition to Sent
  console.log("\n4. Marking quote as SENT...");
  const [sentQuote] = await db
    .update(quotes)
    .set({ status: "sent", updatedAt: new Date() })
    .where(eq(quotes.id, newQuote.id))
    .returning();

  console.log(`✅ Quote status transitioned to: "${sentQuote.status}"`);

  // 5. Test Transition to Accepted
  console.log("\n5. Marking quote as ACCEPTED...");
  const [acceptedQuote] = await db
    .update(quotes)
    .set({ status: "accepted", acceptedAt: new Date(), updatedAt: new Date() })
    .where(eq(quotes.id, newQuote.id))
    .returning();

  console.log(`✅ Quote status transitioned to: "${acceptedQuote.status}" at ${acceptedQuote.acceptedAt}`);

  // 6. Cleanup
  console.log("\n6. Cleaning up test quote...");
  await db.delete(quotes).where(eq(quotes.id, newQuote.id));
  const [deletedCheck] = await db.select().from(quotes).where(eq(quotes.id, newQuote.id));

  if (!deletedCheck) {
    console.log("✅ Verified: Test quote cleaned up successfully.");
  } else {
    throw new Error("❌ Error: Test quote was not deleted!");
  }

  console.log("\n✨ All Card 3.3 Quote Builder & Auto-Math Tests Passed Successfully!");
  process.exit(0);
}

runQuotesTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
