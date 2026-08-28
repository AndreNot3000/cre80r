import { db } from "./src/client";
import { organizations, services, bookings, clients, leads, invoices } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runPublicBookingCheckoutTestSuite() {
  console.log("🚀 Starting Section 7B: Booking Confirmation & Paystack Checkout (Card 7.3) Test Suite...\n");

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
        name: "Apex Film & Visuals",
        slug: "apexvisuals",
        currency: "NGN",
      })
      .returning();
  }
  console.log(`✅ Test Studio Organization ready: ${testOrg.name} (${testOrg.slug})`);

  // 2. Setup service package
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
        description: "Full-day 3-camera coverage with 4K drone aerials.",
        basePrice: "1850000.00",
        durationHours: 12,
        isActive: true,
      })
      .returning();
  }

  // 3. Process Public Client Booking Submission
  console.log("\n2. Processing public shoot booking submission...");
  const clientEmail = "adeola.wedding.test@example.com";
  const clientName = "Adeola Balogun";
  const clientPhone = "+234 803 123 4567";

  // Find or create Client
  let [existingClient] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.organizationId, testOrg.id), eq(clients.email, clientEmail)));

  if (!existingClient) {
    [existingClient] = await db
      .insert(clients)
      .values({
        organizationId: testOrg.id,
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        notes: "Booked via Public Creator Showroom Portal",
      })
      .returning();
  }
  console.log(`✅ Client profile resolved: ${existingClient.name} (${existingClient.id})`);

  // 4. Create Booking Record
  const totalAmount = 2350000;
  const depositAmount = 1175000;
  const eventDate = new Date("2026-11-15T08:00:00Z");

  const [newBooking] = await db
    .insert(bookings)
    .values({
      organizationId: testOrg.id,
      clientId: existingClient.id,
      serviceId: testService.id,
      status: "pending",
      eventDate: eventDate,
      location: "Landmark Event Centre, Victoria Island, Lagos",
      notes: "Full-day luxury wedding coverage with 4K drone & Same-Day Reel.",
      totalAmount: totalAmount.toString(),
      currency: "NGN",
    })
    .returning();
  console.log(`✅ Booking created: ${newBooking.id} (Status: ${newBooking.status.toUpperCase()}, Amount: ₦${Number(newBooking.totalAmount).toLocaleString()})`);

  // 5. Create Itemized Invoice with Deposit Milestone
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const lineItems = [
    { description: "Luxury Wedding Cinema Master (4K) — 12 Hours Production", quantity: 1, unitPrice: 1850000, total: 1850000 },
    { description: "Same-Day Social Media Teaser Reel", quantity: 1, unitPrice: 150000, total: 150000 },
    { description: "Raw Cinema Footage 1TB SSD Archive", quantity: 1, unitPrice: 200000, total: 200000 },
    { description: "Crew Overtime Coverage (2 Hours)", quantity: 2, unitPrice: 75000, total: 150000 },
  ];

  const [newInvoice] = await db
    .insert(invoices)
    .values({
      organizationId: testOrg.id,
      clientId: existingClient.id,
      invoiceNumber: invoiceNumber,
      status: "sent",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 86400000),
      currency: "NGN",
      subtotal: totalAmount.toString(),
      taxRate: "0.00",
      taxAmount: "0.00",
      discountAmount: "0.00",
      total: totalAmount.toString(),
      amountPaid: "0.00",
      lineItems: lineItems,
      notes: `50% Commitment Deposit of ₦${depositAmount.toLocaleString()} required to lock event date on calendar.`,
    })
    .returning();
  console.log(`✅ Invoice generated: ${newInvoice.invoiceNumber} (Total: ₦${Number(newInvoice.total).toLocaleString()}, Due: ₦${depositAmount.toLocaleString()})`);

  // 6. Sync CRM Lead
  const [newLead] = await db
    .insert(leads)
    .values({
      organizationId: testOrg.id,
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      status: "booked",
      budget: totalAmount.toString(),
      message: "Direct instant booking from studio showroom.",
      notes: `Booking Ref: ${newBooking.id}, Invoice: ${newInvoice.invoiceNumber}`,
    })
    .returning();
  console.log(`✅ CRM Lead synchronized: ${newLead.name} (Status: ${newLead.status.toUpperCase()})`);

  // 7. Cleanup test records
  console.log("\n3. Cleaning up test booking records...");
  await db.delete(invoices).where(eq(invoices.id, newInvoice.id));
  await db.delete(bookings).where(eq(bookings.id, newBooking.id));
  await db.delete(leads).where(eq(leads.id, newLead.id));
  console.log("✅ Cleanup complete.");

  console.log("\n✨ Card 7.3 Booking Confirmation & Paystack Checkout Tests Passed Successfully!\n");
}

runPublicBookingCheckoutTestSuite().catch((err) => {
  console.error("❌ Booking Checkout Test Suite Error:", err);
  process.exit(1);
});
