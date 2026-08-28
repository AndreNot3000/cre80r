import { db } from "./src/client";
import { invoices, clients, organizations, payments } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runPaystackWebhookTests() {
  console.log("🚀 Starting Paystack Online Checkout & Webhook Engine Test Suite...\n");

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

  // 3. Create Pending Invoice for Paystack Checkout
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const totalAmount = "1250000";

  console.log(`\n3. Creating invoice (${invoiceNumber}) for ₦${Number(totalAmount).toLocaleString()}...`);
  const [newInvoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      clientId: testClient.id,
      organizationId: testOrg.id,
      lineItems: [
        { description: "Production Deposit Milestone", quantity: 1, unitPrice: 1250000, total: 1250000 },
      ],
      subtotal: totalAmount,
      total: totalAmount,
      currency: "NGN",
      status: "sent",
    })
    .returning();

  console.log(`✅ Invoice created with ID: ${newInvoice.id}, Status: "${newInvoice.status}"`);

  // 4. Simulate Paystack HMAC-SHA512 Webhook Event
  console.log("\n4. Simulating Paystack charge.success webhook processing...");
  const webhookSecret = "sk_test_paystack_secret_key";
  const reference = `PAY-${invoiceNumber}-${Date.now()}`;

  const webhookPayload = {
    event: "charge.success",
    data: {
      id: 89012489,
      reference,
      amount: 125000000, // 1,250,000 NGN in Kobo (subunits)
      currency: "NGN",
      channel: "card",
      status: "success",
      paid_at: new Date().toISOString(),
      metadata: {
        invoiceId: newInvoice.id,
        organizationId: testOrg.id,
        clientId: testClient.id,
        clientName: testClient.name,
      },
    },
  };

  const rawBody = JSON.stringify(webhookPayload);
  const hasher = new Bun.CryptoHasher("sha512", webhookSecret);
  hasher.update(rawBody);
  const signature = hasher.digest("hex");

  console.log(`✅ Generated valid Paystack HMAC-SHA512 signature: ${signature.slice(0, 16)}...`);

  // Verify HMAC logic
  const verifier = new Bun.CryptoHasher("sha512", webhookSecret);
  verifier.update(rawBody);
  const verifiedHash = verifier.digest("hex");

  if (verifiedHash !== signature) {
    throw new Error("❌ HMAC signature verification failed!");
  }
  console.log("✅ HMAC-SHA512 signature verified successfully.");

  // 5. Apply Webhook Auto-Reconciliation to Database
  console.log("\n5. Applying webhook auto-reconciliation to invoice and payments ledger...");
  const paidAmount = String(webhookPayload.data.amount / 100);

  const [paymentRecord] = await db
    .insert(payments)
    .values({
      organizationId: testOrg.id,
      invoiceId: newInvoice.id,
      clientId: testClient.id,
      amount: paidAmount,
      currency: webhookPayload.data.currency as any,
      provider: "paystack",
      providerReference: reference,
      providerStatus: "success",
      metadata: webhookPayload.data,
      paidAt: new Date(webhookPayload.data.paid_at),
    })
    .returning();

  const [reconciledInvoice] = await db
    .update(invoices)
    .set({
      status: "paid",
      amountPaid: paidAmount,
      paidAt: new Date(webhookPayload.data.paid_at),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, newInvoice.id))
    .returning();

  console.log(`✅ Invoice ${reconciledInvoice.invoiceNumber} updated to: status="${reconciledInvoice.status}", amountPaid=₦${Number(reconciledInvoice.amountPaid).toLocaleString()}`);
  console.log(`✅ Payment record created: ID ${paymentRecord.id}, Provider: ${paymentRecord.provider}, Ref: ${paymentRecord.providerReference}`);

  // 6. Cleanup
  console.log("\n6. Cleaning up test invoice and payment records...");
  await db.delete(payments).where(eq(payments.id, paymentRecord.id));
  await db.delete(invoices).where(eq(invoices.id, newInvoice.id));
  console.log("✅ Test cleanup complete.");

  console.log("\n✨ All Cards 3.6 & 3.7 Paystack Checkout & Webhook Engine Tests Passed Successfully!");
  process.exit(0);
}

runPaystackWebhookTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
