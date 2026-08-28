import { db } from "./src/client";
import { messages, projects, clients, organizations } from "./src/schema";
import { eq, and, asc } from "drizzle-orm";

async function runMessagesTests() {
  console.log("🚀 Starting Section 4C: In-App Messaging & Communication Engine Test Suite...\n");

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

  // 2. Setup test client & project
  console.log("2. Setting up test client and project...");
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
        organizationId: testOrg.id,
      })
      .returning();
  }

  const [testProject] = await db
    .insert(projects)
    .values({
      organizationId: testOrg.id,
      clientId: testClient.id,
      name: "Ade & Tolu Cinema Trailer Thread",
      status: "shoot",
    })
    .returning();
  console.log(`✅ Test Project ready: ${testProject.name} (${testProject.id})`);

  // 3. Send creator message with attachment
  console.log("\n3. Inserting creator message with moodboard attachment...");
  const [m1] = await db
    .insert(messages)
    .values({
      organizationId: testOrg.id,
      projectId: testProject.id,
      clientId: testClient.id,
      senderName: "Emeka Obi",
      senderRole: "creator",
      content: "Hi Adeola & Tolu! Here is the visual moodboard and golden hour shot list for Saturday.",
      attachments: [
        { name: "Wedding_Moodboard_2026.pdf", url: "https://crea8or.app/files/moodboard.pdf", size: "3.2 MB" },
      ],
    })
    .returning();
  console.log(`✅ Creator message saved (ID: ${m1.id}): "${m1.content}"`);

  // 4. Send client reply message
  console.log("\n4. Inserting client reply message...");
  const [m2] = await db
    .insert(messages)
    .values({
      organizationId: testOrg.id,
      projectId: testProject.id,
      clientId: testClient.id,
      senderName: "Tolulope Adebayo",
      senderRole: "client",
      content: "The moodboard looks breathtaking! We love the oceanfront sunset color palette.",
    })
    .returning();
  console.log(`✅ Client reply saved (ID: ${m2.id}): "${m2.content}"`);

  // 5. Query thread messages
  console.log("\n5. Querying thread messages in chronological order...");
  const thread = await db
    .select()
    .from(messages)
    .where(and(eq(messages.organizationId, testOrg.id), eq(messages.projectId, testProject.id)))
    .orderBy(asc(messages.createdAt));

  console.log(`✅ Retrieved ${thread.length} messages in project thread:`);
  thread.forEach((msg, idx) => {
    console.log(`   [${idx + 1}] (${msg.senderRole.toUpperCase()}) ${msg.senderName}: "${msg.content}"`);
  });

  if (thread.length !== 2) {
    throw new Error(`Expected 2 messages, got ${thread.length}`);
  }

  // 6. Cleanup
  console.log("\n6. Cleaning up test messages and project...");
  await db.delete(messages).where(eq(messages.projectId, testProject.id));
  await db.delete(projects).where(eq(projects.id, testProject.id));
  console.log("✅ Cleanup complete.");

  console.log("\n✨ All Card 4.5 In-App Messaging Tests Passed Successfully!");
  process.exit(0);
}

runMessagesTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
