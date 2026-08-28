import { db } from "./src/client";
import { callSheets, projects, clients, organizations } from "./src/schema";
import { eq, and } from "drizzle-orm";

async function runCallSheetTests() {
  console.log("🚀 Starting Section 4B: Shoot Call Sheet Engine Test Suite...\n");

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

  // 2. Setup test project
  console.log("2. Setting up test project...");
  const [testProject] = await db
    .insert(projects)
    .values({
      organizationId: testOrg.id,
      name: "AfroNation 4K Festival Master Movie",
      status: "pre_production",
      shootDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    })
    .returning();
  console.log(`✅ Test Project ready: ${testProject.name} (${testProject.id})`);

  // 3. Create Call Sheet
  console.log("\n3. Creating official digital call sheet...");
  const [newCallSheet] = await db
    .insert(callSheets)
    .values({
      organizationId: testOrg.id,
      projectId: testProject.id,
      title: "AfroNation 4K Festival Day 1 Call Sheet",
      shootDate: testProject.shootDate!,
      generalCallTime: "06:30 AM",
      locationName: "Tafawa Balewa Square (TBS), Lagos",
      locationAddress: "TBS Complex, Lagos Island, Lagos",
      locationMapsUrl: "https://maps.google.com/?q=TBS+Lagos",
      parkingNotes: "Crew parking at West Gate. Display CREA8OR press pass on dashboard.",
      weatherForecast: "Sunny / Clear Skies 30°C",
      nearestHospital: "Lagos Island General Hospital",
      crew: [
        { name: "Emeka Obi", role: "Director of Photography", callTime: "06:00 AM", phone: "+234 803 111 2222" },
        { name: "Chidi Eze", role: "FPV & Heavy Lift Drone Pilot", callTime: "06:30 AM", phone: "+234 802 333 4444" },
      ],
      schedule: [
        { time: "06:00 AM", scene: "Main Rigging & Wireless Video Video Transmitter Setup", notes: "FOH Tower" },
        { time: "08:00 AM", scene: "Artist Soundcheck & Rehearsal Multi-Cam", notes: "Main Stage" },
        { time: "04:00 PM", scene: "Festival Gate Open & Crowd B-Roll", notes: "All Zones" },
        { time: "07:30 PM", scene: "Headline Act 4K Cinema Coverage", notes: "Stage Pit" },
      ],
      gearList: [
        { category: "Camera", item: "Sony FX9 + 28-135mm Cinema Zoom", packed: true },
        { category: "Camera", item: "Sony FX6 + 24-70mm GM II", packed: true },
        { category: "Audio", item: "Sound Devices 833 8-Channel Recorder", packed: false },
      ],
      emergencyContacts: [
        { role: "Safety Officer", name: "Capt. Idris", phone: "+234 800 112 9999" },
      ],
      notes: "Strict high-visibility vests required on-stage during pyrotechnics.",
    })
    .returning();

  console.log("✅ Call Sheet created successfully:", {
    id: newCallSheet.id,
    title: newCallSheet.title,
    callTime: newCallSheet.generalCallTime,
    location: newCallSheet.locationName,
    crewCount: (newCallSheet.crew as any[]).length,
    scheduleStops: (newCallSheet.schedule as any[]).length,
  });

  // 4. Test Updating Gear Checklist
  console.log("\n4. Updating gear checklist to packed status...");
  const updatedGear = (newCallSheet.gearList as any[]).map((g) => ({ ...g, packed: true }));

  const [updatedCallSheet] = await db
    .update(callSheets)
    .set({ gearList: updatedGear, updatedAt: new Date() })
    .where(eq(callSheets.id, newCallSheet.id))
    .returning();

  const allPacked = (updatedCallSheet.gearList as any[]).every((g) => g.packed);
  if (allPacked) {
    console.log("✅ All equipment verified as packed in gear manifest!");
  } else {
    throw new Error("❌ Error updating gear list!");
  }

  // 5. Cleanup
  console.log("\n5. Cleaning up test call sheet and project...");
  await db.delete(callSheets).where(eq(callSheets.id, newCallSheet.id));
  await db.delete(projects).where(eq(projects.id, testProject.id));
  console.log("✅ Cleanup complete.");

  console.log("\n✨ All Cards 4.3 & 4.4 Shoot Call Sheet Engine Tests Passed Successfully!");
  process.exit(0);
}

runCallSheetTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
