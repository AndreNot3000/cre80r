import { db } from "./src/client";
import { galleries, galleryPhotos, clients, projects, organizations } from "./src/schema";
import { eq, and, asc } from "drizzle-orm";

async function runGalleriesTests() {
  console.log("🚀 Starting Section 5A: 4K Client Photo Galleries Test Suite...\n");

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
        organizationId: testOrg.id,
      })
      .returning();
  }

  // 3. Create 4K Photo Gallery
  console.log("\n3. Creating 4K client photo gallery with PIN & watermark protection...");
  const uniqueSlug = `ade-tolu-luxury-wedding-4k-${Date.now()}`;

  const [newGallery] = await db
    .insert(galleries)
    .values({
      organizationId: testOrg.id,
      clientId: testClient.id,
      title: "Adeola & Tolulope Luxury Wedding (4K Master Deliverable)",
      slug: uniqueSlug,
      coverPhoto: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600",
      password: "adeolawedding",
      downloadPin: "9944",
      watermarkEnabled: true,
      allowDownloads: true,
      status: "published",
    })
    .returning();

  console.log("✅ Gallery created successfully:", {
    id: newGallery.id,
    title: newGallery.title,
    slug: newGallery.slug,
    watermarkEnabled: newGallery.watermarkEnabled,
    downloadPin: newGallery.downloadPin,
  });

  // 4. Batch Upload Photos with EXIF & Categories
  console.log("\n4. Ingesting batch 4K photos into gallery...");
  const samplePhotos = [
    {
      galleryId: newGallery.id,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600",
      thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
      filename: "Ceremony_Altar_Vows_001.jpg",
      sizeBytes: 12400000, // ~12.4 MB
      category: "Ceremony",
      exifData: { camera: "Sony A1", lens: "Sony FE 85mm f/1.4 GM", aperture: "f/1.4", iso: 100, shutter: "1/800s" },
      sortOrder: 1,
    },
    {
      galleryId: newGallery.id,
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600",
      thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600",
      filename: "Golden_Hour_Couple_002.jpg",
      sizeBytes: 15100000, // ~15.1 MB
      category: "Portraits",
      exifData: { camera: "Sony A1", lens: "Sony FE 50mm f/1.2 GM", aperture: "f/1.2", iso: 80, shutter: "1/1250s" },
      sortOrder: 2,
    },
  ];

  const insertedPhotos = await db.insert(galleryPhotos).values(samplePhotos).returning();
  console.log(`✅ ${insertedPhotos.length} Photos ingested into gallery.`);

  // 5. Toggle Client Favorite on photo
  console.log("\n5. Testing client proofing favorite toggle...");
  const [favoritePhoto] = await db
    .update(galleryPhotos)
    .set({ isFavorite: true, clientNotes: "Please retouch background light flare for wedding album spread" })
    .where(eq(galleryPhotos.id, insertedPhotos[0]!.id))
    .returning();

  console.log(`✅ Photo favorited by client: isFavorite=${favoritePhoto.isFavorite}, Notes="${favoritePhoto.clientNotes}"`);

  // 6. Query gallery and photos
  console.log("\n6. Querying gallery photos with categories...");
  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.galleryId, newGallery.id))
    .orderBy(asc(galleryPhotos.sortOrder));

  console.log(`✅ Successfully retrieved ${photos.length} photos for gallery ${newGallery.slug}`);

  // 7. Cleanup
  console.log("\n7. Cleaning up test gallery and photos...");
  await db.delete(galleryPhotos).where(eq(galleryPhotos.galleryId, newGallery.id));
  await db.delete(galleries).where(eq(galleries.id, newGallery.id));
  console.log("✅ Cleanup complete.");

  console.log("\n✨ All Card 5.1 4K Photo Gallery Management Tests Passed Successfully!");
  process.exit(0);
}

runGalleriesTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
