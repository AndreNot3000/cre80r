import { db } from "./client";
import * as schema from "./schema";

async function seed() {
  console.log("Seeding initial demo data into PostgreSQL...");

  try {
    // 1. Create Organization
    const [org] = await db
      .insert(schema.organizations)
      .values({
        name: "Apex Film & Visuals",
        slug: "apexvisuals",
        creatorType: "videographer",
        currency: "NGN",
        timezone: "Africa/Lagos",
        phone: "+234 802 345 6789",
        country: "NG",
        city: "Lagos",
      })
      .returning();

    // 2. Create User
    const [user] = await db
      .insert(schema.users)
      .values({
        id: "usr_apex_creator_1",
        organizationId: org!.id,
        name: "Emeka Obi",
        email: "emeka@apexvisuals.com",
        role: "creator",
        emailVerified: true,
      })
      .returning();

    // 3. Create Clients
    const [client1] = await db
      .insert(schema.clients)
      .values({
        organizationId: org!.id,
        name: "Adeola & Tolulope Wedding",
        email: "tolu.wedding@example.com",
        phone: "+234 802 345 6789",
        instagram: "@adeandtolu2026",
        city: "Lagos",
        country: "Nigeria",
        tags: ["Wedding", "VIP", "Cinematography"],
      })
      .returning();

    const [client2] = await db
      .insert(schema.clients)
      .values({
        organizationId: org!.id,
        name: "Kolawole Luxury Wear",
        email: "press@kolawole.ng",
        phone: "+234 813 456 7890",
        instagram: "@kolawoleofficial",
        city: "Abuja",
        country: "Nigeria",
        tags: ["Commercial", "Retainer", "Lookbook"],
      })
      .returning();

    // 4. Create Leads
    await db.insert(schema.leads).values([
      {
        organizationId: org!.id,
        name: "Chidinma Nwosu",
        email: "chidinma@example.com",
        phone: "+234 803 123 4567",
        serviceInterest: "Wedding Photography & 4K Reel",
        budget: "850000",
        currency: "NGN",
        status: "new",
      },
      {
        organizationId: org!.id,
        name: "Zikora Studios",
        email: "contact@zikorastudios.com",
        phone: "+234 812 987 6543",
        serviceInterest: "Brand Commercial Video",
        budget: "1500000",
        currency: "NGN",
        status: "contacted",
      },
    ]);

    // 5. Create Services
    await db.insert(schema.services).values([
      {
        organizationId: org!.id,
        name: "Full-Day Luxury Wedding Cinema",
        description: "Complete full-day cinema coverage for weddings, ceremonies, and receptions.",
        basePrice: "1850000",
        currency: "NGN",
        durationHours: 12,
        isActive: true,
      },
      {
        organizationId: org!.id,
        name: "Commercial Brand Lookbook / Campaign",
        description: "High-end editorial photoshoot and commercial 4K video for fashion and consumer brands.",
        basePrice: "1500000",
        currency: "NGN",
        durationHours: 8,
        isActive: true,
      },
    ]);

    // 6. Create 4K Photo Galleries
    await db.insert(schema.galleries).values([
      {
        organizationId: org!.id,
        clientId: client1!.id,
        title: "Adeola & Tolulope Traditional Wedding",
        slug: "ade-tolu-traditional-wedding",
        status: "published",
        watermarkEnabled: false,
        allowDownloads: true,
      },
      {
        organizationId: org!.id,
        clientId: client2!.id,
        title: "Kolawole Luxury Brand Lookbook Q3",
        slug: "kolawole-lookbook-2026",
        status: "published",
        watermarkEnabled: true,
        allowDownloads: true,
      },
    ]);

    // 7. Create Invoices
    await db.insert(schema.invoices).values([
      {
        organizationId: org!.id,
        clientId: client1!.id,
        invoiceNumber: "INV-802911",
        status: "paid",
        lineItems: [{ description: "Full Day Wedding Cinema Production", quantity: 1, unitPrice: 1850000 }],
        subtotal: "1850000",
        total: "1850000",
        amountPaid: "1850000",
        currency: "NGN",
      },
      {
        organizationId: org!.id,
        clientId: client2!.id,
        invoiceNumber: "INV-802912",
        status: "sent",
        lineItems: [{ description: "Commercial Brand Lookbook Campaign", quantity: 1, unitPrice: 1500000 }],
        subtotal: "1500000",
        total: "1500000",
        amountPaid: "0",
        currency: "NGN",
      },
    ]);

    console.log("✓ Demo dataset successfully seeded into PostgreSQL database!");
  } catch (err: any) {
    console.error("Seed error:", err.message);
  }
}

seed();
