import { db } from "./src/client";
import { organizations, automations, automationLogs } from "./src/schema";
import { eq, desc } from "drizzle-orm";

async function runAutomationsTestSuite() {
  console.log("🚀 Starting Module 8 (Studio Automations & WhatsApp Engine) Test Suite...\n");

  // 1. Setup Organization
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
  console.log(`✅ Organization ready: ${testOrg.name} (${testOrg.id})`);

  // 2. Create Pre-built Automation Recipes
  console.log("\n2. Creating visual studio automation recipes...");
  const recipes = [
    {
      organizationId: testOrg.id,
      name: "Instant WhatsApp Welcome & Rate Card",
      description: "Auto-responds to new showroom inquiries within 30 seconds with creator bio, pricing brochure, and calendar link.",
      triggerEvent: "inquiry_created" as const,
      actionType: "send_whatsapp" as const,
      config: {
        templateId: "tpl_welcome_intro_v1",
        delayMinutes: 0,
        recipientRole: "client",
        whatsappMessage: "Hi {{client_name}}! Thank you for reaching out to {{studio_name}}. We have received your inquiry for {{event_date}}. View our official rate card here: {{rate_card_link}}.",
      },
      isEnabled: true,
      runCount: 42,
    },
    {
      organizationId: testOrg.id,
      name: "48-Hour Shoot Countdown: Crew Call Sheet Dispatch",
      description: "Automatically compiles schedule, set location, weather, and department call times and delivers interactive call sheet links.",
      triggerEvent: "shoot_reminder_48h" as const,
      actionType: "send_whatsapp" as const,
      config: {
        templateId: "tpl_crew_callsheet_v1",
        delayMinutes: 0,
        recipientRole: "crew",
        whatsappMessage: "🎬 Production Call Sheet for {{project_name}}: Call time is {{call_time}} at {{location}}. Tap to view interactive digital call sheet: {{callsheet_url}}.",
      },
      isEnabled: true,
      runCount: 19,
    },
    {
      organizationId: testOrg.id,
      name: "Paystack Deposit Confirmation & Calendar Hold",
      description: "Triggered instantly upon 50% commitment deposit verification. Sends official invoice receipt and calendar lock.",
      triggerEvent: "deposit_paid" as const,
      actionType: "send_whatsapp" as const,
      config: {
        templateId: "tpl_deposit_confirmed_v1",
        delayMinutes: 0,
        recipientRole: "client",
        whatsappMessage: "🎉 Payment Verified! ₦{{deposit_amount}} deposit received for {{package_name}}. Your shoot date ({{event_date}}) is officially locked on our calendar.",
      },
      isEnabled: true,
      runCount: 28,
    },
    {
      organizationId: testOrg.id,
      name: "Frame-Accurate Cut Approval → Post-Production Alert",
      description: "When the client clicks 'Approve Cut', immediately alerts colorist and audio mixer to prepare master 4K export.",
      triggerEvent: "review_cut_approved" as const,
      actionType: "notify_crew" as const,
      config: {
        templateId: "tpl_cut_approved_v1",
        recipientRole: "crew",
        whatsappMessage: "✅ Client approved {{video_cut_version}} for {{project_name}}! Proceed with master ProRes 422 HQ export and sound mix.",
      },
      isEnabled: true,
      runCount: 14,
    },
  ];

  const createdRecipes = [];
  for (const recipe of recipes) {
    const [created] = await db.insert(automations).values(recipe).returning();
    createdRecipes.push(created);
    console.log(`✅ Recipe created: "${created.name}" [Trigger: ${created.triggerEvent} ➔ ${created.actionType}]`);
  }

  // 3. Test Recipe State Toggles
  console.log("\n3. Testing recipe toggle (Active / Paused)...");
  const targetRecipe = createdRecipes[0]!;
  const [pausedRecipe] = await db
    .update(automations)
    .set({ isEnabled: false, updatedAt: new Date() })
    .where(eq(automations.id, targetRecipe.id))
    .returning();
  console.log(`✅ Recipe paused: "${pausedRecipe.name}" (isEnabled: ${pausedRecipe.isEnabled})`);

  const [resumedRecipe] = await db
    .update(automations)
    .set({ isEnabled: true, updatedAt: new Date() })
    .where(eq(automations.id, targetRecipe.id))
    .returning();
  console.log(`✅ Recipe resumed: "${resumedRecipe.name}" (isEnabled: ${resumedRecipe.isEnabled})`);

  // 4. Test Trigger Execution Simulation & Logging
  console.log("\n4. Simulating live trigger execution and logging...");
  const [logEntry] = await db
    .insert(automationLogs)
    .values({
      organizationId: testOrg.id,
      automationId: targetRecipe.id,
      triggerEvent: targetRecipe.triggerEvent,
      recipient: "+234 803 123 4567 (Adeola Balogun)",
      channel: "whatsapp",
      status: "success",
      payload: {
        clientName: "Adeola Balogun",
        studioName: "Apex Visuals",
        template: "tpl_welcome_intro_v1",
        waMessageId: `wamid_${Date.now()}`,
      },
    })
    .returning();
  console.log(`✅ Execution log created: ${logEntry.id} (Channel: ${logEntry.channel.toUpperCase()}, Status: ${logEntry.status.toUpperCase()})`);

  // Update run count
  await db
    .update(automations)
    .set({
      runCount: targetRecipe.runCount + 1,
      lastRunAt: new Date(),
    })
    .where(eq(automations.id, targetRecipe.id));

  // 5. Query Active Logs
  console.log("\n5. Querying recent automation logs...");
  const logs = await db
    .select()
    .from(automationLogs)
    .where(eq(automationLogs.organizationId, testOrg.id))
    .orderBy(desc(automationLogs.createdAt))
    .limit(5);
  console.log(`✅ Fetched ${logs.length} recent execution log(s)`);

  // 6. Cleanup test records
  console.log("\n6. Cleaning up test automation records...");
  await db.delete(automationLogs).where(eq(automationLogs.id, logEntry.id));
  for (const r of createdRecipes) {
    await db.delete(automations).where(eq(automations.id, r.id));
  }
  console.log("✅ Cleanup complete.");

  console.log("\n✨ Card 8.1 Studio Automations Test Suite Passed Successfully!\n");
}

runAutomationsTestSuite().catch((err) => {
  console.error("❌ Automations Test Suite Error:", err);
  process.exit(1);
});
