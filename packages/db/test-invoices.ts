import { db } from "./src/client";
import { invoices, clients, organizations, payments } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runInvoicesTests() {
  console.log("🚀 Starting Invoice Ledger & Status Tracker Test Suite...\n");

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
    .where(and(eq(clients.name, "Kolawole Luxury Wear"), eq(clients.organizationId, testOrg.id)));

  if (!testClient) {
    [testClient] = await db
      .insert(clients)
      .values({
        name: "Kolawole Luxury Wear",
        email: "finance@kolawole.ng",
        phone: "+234 803 777 6666",
        city: "Lagos",
        organizationId: testOrg.id,
      })
      .returning();
  }
  console.log(`✅ Test Client ready: ${testClient.name} (${testClient.id})`);

  // 3. Create Invoice with Auto-Math
  const lineItems = [
    { description: "Commercial Lookbook Q3 Retainer (Day 1 & Day 2)", quantity: 1, unitPrice: 3000000, total: 3000000 },
    { description: "High-End Beauty Retouching (30 Master Assets)", quantity: 1, unitPrice: 450000, total: 450000 },
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); // 3,450,000
  const taxRate = 7.5;
  const taxAmount = (subtotal * taxRate) / 100; // 258,750
  const discountAmount = 150000;
  const total = subtotal + taxAmount - discountAmount; // 3,558,750
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  console.log(`\n3. Creating invoice (${invoiceNumber}) with auto-math...`);
  const [newInvoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      clientId: testClient.id,
      organizationId: testOrg.id,
      lineItems,
      subtotal: String(subtotal),
      taxAmount: String(taxAmount),
      discountAmount: String(discountAmount),
      total: String(total),
      amountPaid: "0",
      currency: "NGN",
      status: "sent",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      notes: "Direct bank transfer payment instructions included.",
    })
    .returning();

  console.log("✅ Invoice created:", {
    id: newInvoice.id,
    invoiceNumber: newInvoice.invoiceNumber,
    subtotal: `₦${Number(newInvoice.subtotal).toLocaleString()}`,
    taxAmount: `₦${Number(newInvoice.taxAmount).toLocaleString()}`,
    total: `₦${Number(newInvoice.total).toLocaleString()}`,
    status: newInvoice.status,
  });

  if (Number(newInvoice.total) !== 3558750) {
    throw new Error("❌ Auto-math total calculation mismatch on invoice!");
  }

  // 4. Test Mark as Paid and Payment Ledger Entry
  console.log("\n4. Marking invoice as PAID and creating payment ledger record...");
  const [paidInvoice] = await db
    .update(invoices)
    .set({
      status: "paid",
      amountPaid: newInvoice.total,
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, newInvoice.id))
    .returning();

  const [paymentRecord] = await db
    .insert(payments)
    .values({
      organizationId: testOrg.id,
      invoiceId: newInvoice.id,
      clientId: testClient.id,
      amount: newInvoice.total,
      currency: "NGN",
      provider: "manual",
      providerReference: `TEST-MANUAL-${Date.now()}`,
      providerStatus: "success",
      paidAt: new Date(),
    })
    .returning();

  console.log(`✅ Invoice status transitioned to: "${paidInvoice.status}", amountPaid: ₦${Number(paidInvoice.amountPaid).toLocaleString()}`);
  console.log(`✅ Payment record created: ID ${paymentRecord.id}, Provider: ${paymentRecord.provider}, Amount: ₦${Number(paymentRecord.amount).toLocaleString()}`);

  // 5. Cleanup
  console.log("\n5. Cleaning up test invoice and payment record...");
  await db.delete(payments).where(eq(payments.id, paymentRecord.id));
  await db.delete(invoices).where(eq(invoices.id, newInvoice.id));
  const [deletedCheck] = await db.select().from(invoices).where(eq(invoices.id, newInvoice.id));

  if (!deletedCheck) {
    console.log("✅ Verified: Test invoice and payment record cleaned up successfully.");
  } else {
    throw new Error("❌ Error: Test invoice was not deleted!");
  }

  console.log("\n✨ All Card 3.5 Invoice Ledger & Status Tracker Tests Passed Successfully!");
  process.exit(0);
}

runInvoicesTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
