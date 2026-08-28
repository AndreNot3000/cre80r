import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { organizations, services, galleries, videoReviews, users, members } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";

const FALLBACK_TESTIMONIALS = [
  {
    id: "test-1",
    authorName: "Tolulope Adebayo",
    authorRole: "Bride • Destination Luxury Wedding",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    rating: 5,
    quote: "The 4K cinematic highlight film and wedding gallery exceeded every expectation. Approving cuts using the frame-accurate review link made collaborating from London effortless!",
    date: "August 2026",
    eventType: "Wedding Cinema",
  },
  {
    id: "test-2",
    authorName: "Kolawole Olufemi",
    authorRole: "Brand Director • Kolawole Luxury",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    rating: 5,
    quote: "Turnaround time was under 5 days for our commercial campaign lookbook. The automated Paystack payment and contract workflow made working with Apex Visuals seamlessly professional.",
    date: "July 2026",
    eventType: "Commercial Campaign",
  },
  {
    id: "test-3",
    authorName: "Somto Eze",
    authorRole: "Creative Director • Lagos Fashion Week",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    rating: 5,
    quote: "Exceptional lighting and camera work. The digital call sheet on WhatsApp ensured the 12-person crew was perfectly synchronized across 3 studio sets.",
    date: "June 2026",
    eventType: "Fashion Editorial",
  },
];

const FALLBACK_GALLERIES = [
  {
    id: "gal-1",
    title: "Adeola & Tolulope Luxury Wedding (4K Master)",
    slug: "adeola-tolulope-wedding-demo",
    coverPhoto: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    category: "Wedding",
    photoCount: 48,
  },
  {
    id: "gal-2",
    title: "Kolawole Luxury Brand Q3 Campaign Lookbook",
    slug: "kolawole-luxury-q3-demo",
    coverPhoto: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200",
    category: "Commercial",
    photoCount: 32,
  },
  {
    id: "gal-3",
    title: "Afrobeat Vision — Soundstage & Golden Hour",
    slug: "afrobeat-vision-soundstage-demo",
    coverPhoto: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200",
    category: "Music Video",
    photoCount: 24,
  },
  {
    id: "gal-4",
    title: "Vogue Africa Digital Portrait Masterclass",
    slug: "vogue-africa-portrait-demo",
    coverPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200",
    category: "Portraits",
    photoCount: 18,
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = slug?.toLowerCase().trim();

    // 1. Find Organization by slug
    const [foundOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, cleanSlug));

    let orgData: any = foundOrg;
    let servicesData: any[] = [];
    let galleriesData: any[] = [];
    let videosData: any[] = [];

    if (foundOrg) {
      orgData = {
        ...foundOrg,
        tagline: foundOrg.tagline || "4K Cinematic Commercials, Luxury Weddings & Editorial Photography",
        bio: foundOrg.bio || "Award-winning creative production studio. Specializing in high-end 4K cinematography, commercial campaign lookbooks, and luxury wedding films.",
        location: foundOrg.location || `${foundOrg.city || "Lagos"}, ${foundOrg.country || "Nigeria"}`,
        instagram: foundOrg.instagram || `${cleanSlug}.visuals`,
        whatsapp: foundOrg.whatsapp || foundOrg.phone || "+2348030001122",
        heroShowreelUrl: foundOrg.heroShowreelUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        heroPosterUrl: foundOrg.heroPosterUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600",
        stats: {
          shootsCompleted: 140,
          awardsCount: 8,
          clientRating: 4.98,
          experienceYears: 6,
        },
      };

      // 2. Fetch Active Services
      servicesData = await db
        .select()
        .from(services)
        .where(and(eq(services.organizationId, foundOrg.id), eq(services.isActive, true)))
        .orderBy(desc(services.basePrice));

      // 3. Fetch Published Galleries
      galleriesData = await db
        .select({
          id: galleries.id,
          title: galleries.title,
          slug: galleries.slug,
          coverPhoto: galleries.coverPhoto,
          createdAt: galleries.createdAt,
        })
        .from(galleries)
        .where(and(eq(galleries.organizationId, foundOrg.id), eq(galleries.status, "published")))
        .orderBy(desc(galleries.createdAt))
        .limit(8);

      // 4. Fetch Video Cuts
      videosData = await db
        .select({
          id: videoReviews.id,
          title: videoReviews.title,
          version: videoReviews.version,
          videoUrl: videoReviews.videoUrl,
          thumbnailUrl: videoReviews.thumbnailUrl,
          durationSeconds: videoReviews.durationSeconds,
        })
        .from(videoReviews)
        .where(eq(videoReviews.organizationId, foundOrg.id))
        .orderBy(desc(videoReviews.createdAt))
        .limit(4);
    } else {
      // Fallback demo studio profile for previewing showroom
      orgData = {
        id: "demo-org",
        name: cleanSlug === "apexvisuals" ? "Apex Visuals Cinema Studio" : `${cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1)} Visual Studio`,
        slug: cleanSlug,
        tagline: "4K Cinematic Commercials, Luxury Weddings & Editorial Photography",
        bio: "Award-winning creative production studio based in Lagos & London. Specializing in high-end 4K cinematography, anamorphic lens optics, commercial campaign lookbooks, and luxury wedding films across Africa and the diaspora.",
        location: "Victoria Island, Lagos, Nigeria • London, UK",
        currency: "NGN",
        instagram: "apexvisuals.ng",
        whatsapp: "+2348030001122",
        email: "hello@apexvisuals.ng",
        heroShowreelUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        heroPosterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600",
        stats: {
          shootsCompleted: 140,
          awardsCount: 8,
          clientRating: 4.98,
          experienceYears: 6,
        },
      };

      servicesData = [
        {
          id: "serv-1",
          name: "Luxury Wedding Cinema Master (4K)",
          description: "Full-day 3-camera coverage with 4K drone aerials, sound recording, highlight cinema trailer, and 4K digital gallery delivery.",
          basePrice: "1850000.00",
          currency: "NGN",
          durationHours: 12,
          addOns: [
            { name: "Same-Day Teaser Reel (Reels/TikTok)", price: 150000 },
            { name: "Full Raw Documentary Archive SSD", price: 200000 },
          ],
        },
        {
          id: "serv-2",
          name: "Commercial Brand Lookbook & Video Reel",
          description: "Studio or location fashion lookbook, 30 retouched high-res deliverables, 3x 4K promotional video cuts with licensed music.",
          basePrice: "950000.00",
          currency: "NGN",
          durationHours: 8,
          addOns: [
            { name: "Fashion Stylist & Prop Sourcing", price: 250000 },
            { name: "Behind-The-Scenes 4K Mini-Doc", price: 180000 },
          ],
        },
        {
          id: "serv-3",
          name: "Executive & VIP Editorial Portraits",
          description: "Premium studio lighting session with 15 master retouched portraits, multiple outfit changes, and same-week turnaround.",
          basePrice: "350000.00",
          currency: "NGN",
          durationHours: 4,
          addOns: [
            { name: "Professional Make-up & Hair Styling", price: 75000 },
          ],
        },
      ];

      galleriesData = FALLBACK_GALLERIES;
    }

    const sampleFallbackServices = [
      {
        id: "serv-1",
        name: "Luxury Wedding Cinema Master (4K)",
        description: "Full-day 3-camera coverage with 4K drone aerials, sound recording, highlight cinema trailer, and 4K digital gallery delivery.",
        basePrice: "1850000.00",
        currency: orgData.currency || "NGN",
        durationHours: 12,
        addOns: [
          { name: "Same-Day Teaser Reel (Reels/TikTok)", price: 150000 },
          { name: "Full Raw Documentary Archive SSD", price: 200000 },
        ],
      },
      {
        id: "serv-2",
        name: "Commercial Brand Lookbook & Video Reel",
        description: "Studio or location fashion lookbook, 30 retouched high-res deliverables, 3x 4K promotional video cuts with licensed music.",
        basePrice: "950000.00",
        currency: orgData.currency || "NGN",
        durationHours: 8,
        addOns: [
          { name: "Fashion Stylist & Prop Sourcing", price: 250000 },
          { name: "Behind-The-Scenes 4K Mini-Doc", price: 180000 },
        ],
      },
      {
        id: "serv-3",
        name: "Executive & VIP Editorial Portraits",
        description: "Premium studio lighting session with 15 master retouched portraits, multiple outfit changes, and same-week turnaround.",
        basePrice: "350000.00",
        currency: orgData.currency || "NGN",
        durationHours: 4,
        addOns: [
          { name: "Professional Make-up & Hair Styling", price: 75000 },
        ],
      },
    ];

    return NextResponse.json({
      organization: orgData,
      services: servicesData.length > 0 ? servicesData : sampleFallbackServices,
      galleries: galleriesData.length > 0 ? galleriesData : FALLBACK_GALLERIES,
      videoReviews: videosData,
      testimonials: FALLBACK_TESTIMONIALS,
    });
  } catch (error) {
    console.error("GET /api/public/showroom/[slug] error:", error);
    return NextResponse.json({ error: "Failed to load studio showroom" }, { status: 500 });
  }
}
