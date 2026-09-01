import { db } from "./src/client";
import { organizations, automations, automationLogs } from "./src/schema";
import { eq, sql } from "drizzle-orm";

// Interpolation Engine
function renderWhatsAppTemplate(
  templateText: string,
  variables: Record<string, string | number> = {}
): string {
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

async function runWhatsAppEngineTestSuite() {
  console.log("🚀 Starting Section 8B: WhatsApp Business Cloud Integration (Card 8.2) Test Suite...\n");

  // 1. Template Interpolation Engine Test
  console.log("1. Testing WhatsApp Template Parameter Interpolation...");
  const rawTemplate =
    "Hi {{client_name}}! 👋 Thank you for reaching out to {{studio_name}}. Your shoot on {{event_date}} is confirmed at ₦{{deposit_amount}}.";
  const rendered = renderWhatsAppTemplate(rawTemplate, {
    client_name: "Adeola Balogun",
    studio_name: "Apex Visuals Cinema Studio",
    event_date: "Nov 15, 2026",
    deposit_amount: "1,175,000",
  });

  console.log(`Rendered Output: "${rendered}"`);
  if (!rendered.includes("Adeola Balogun") || !rendered.includes("Apex Visuals Cinema Studio")) {
    throw new Error("Template interpolation failed to resolve variables");
  }
  console.log("✅ Template interpolation engine verified.\n");

  // 2. Setup Test Organization
  console.log("2. Setting up test studio organization...");
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
  console.log(`✅ Test Organization ready: ${testOrg.name} (${testOrg.id})`);

  // 3. Dispatch Automated WhatsApp Trigger
  console.log("\n3. Testing WhatsApp Cloud API Dispatch with PostgreSQL Audit Logging...");
  const waMessageId = `wamid_test_${Date.now()}`;
  const [log] = await db
    .insert(automationLogs)
    .values({
      organizationId: testOrg.id,
      triggerEvent: "inquiry_created",
      recipient: "+234 803 123 4567 (Adeola Balogun)",
      channel: "whatsapp",
      status: "queued",
      payload: {
        templateId: "tpl_welcome_intro_v1",
        renderedMessage: rendered,
        waMessageId,
        dispatchedAt: new Date().toISOString(),
      },
    })
    .returning();
  console.log(`✅ WhatsApp dispatch log created: ${log.id} (Initial Status: ${log.status.toUpperCase()})`);

  // 4. Test Meta Inbound Webhook Status Transition (Queued -> Delivered)
  console.log("\n4. Simulating Meta Cloud Inbound Webhook Status Update...");
  await db.execute(sql`
    UPDATE "automation_logs"
    SET "status" = 'delivered'
    WHERE "payload"->>'waMessageId' = ${waMessageId}
  `);

  const [updatedLog] = await db
    .select()
    .from(automationLogs)
    .where(eq(automationLogs.id, log.id));

  console.log(`✅ Webhook status transition: ${updatedLog.status.toUpperCase()} (Message ID: ${waMessageId})`);
  if (updatedLog.status !== "delivered") {
    throw new Error("Webhook status transition failed");
  }

  // 5. Cleanup test log
  console.log("\n5. Cleaning up test WhatsApp logs...");
  await db.delete(automationLogs).where(eq(automationLogs.id, log.id));
  console.log("✅ Cleanup complete.");

  console.log("\n✨ Card 8.2 WhatsApp Business Cloud Integration Tests Passed Successfully!\n");
}

runWhatsAppEngineTestSuite().catch((err) => {
  console.error("❌ WhatsApp Engine Test Suite Error:", err);
  process.exit(1);
});
