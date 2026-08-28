import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { galleries, galleryPhotos, clients, projects, members, organizations } from "@crea8or/db/schema";
import { eq, and, desc, or, ilike, sql } from "drizzle-orm";
import { createGallerySchema } from "@crea8or/validators";

async function getAuthContext() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  let orgId = (session.session as any)?.activeOrganizationId || (session.user as any)?.organizationId;

  if (!orgId) {
    const [membership] = await db
      .select()
      .from(members)
      .where(eq(members.userId, session.user.id));

    if (membership) {
      orgId = membership.organizationId;
    } else {
      const [existingOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, session.user.id.toLowerCase().slice(0, 16)));

      if (existingOrg) {
        orgId = existingOrg.id;
      }
    }
  }

  return { user: session.user, orgId };
}

// GET /api/galleries
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();

    const conditions = [eq(galleries.organizationId, authCtx.orgId)];

    if (status && status !== "all") {
      conditions.push(eq(galleries.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(galleries.title, `%${search}%`),
          ilike(galleries.slug, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        coverPhoto: galleries.coverPhoto,
        password: galleries.password,
        downloadPin: galleries.downloadPin,
        watermarkEnabled: galleries.watermarkEnabled,
        allowDownloads: galleries.allowDownloads,
        status: galleries.status,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
        projectId: galleries.projectId,
        projectName: projects.name,
        clientId: galleries.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        photoCount: sql<number>`cast(count(${galleryPhotos.id}) as integer)`,
      })
      .from(galleries)
      .leftJoin(clients, eq(galleries.clientId, clients.id))
      .leftJoin(projects, eq(galleries.projectId, projects.id))
      .leftJoin(galleryPhotos, eq(galleries.id, galleryPhotos.galleryId))
      .where(and(...conditions))
      .groupBy(galleries.id, clients.name, clients.email, projects.name)
      .orderBy(desc(galleries.createdAt));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/galleries error:", err);
    return NextResponse.json({ error: "Failed to fetch galleries" }, { status: 500 });
  }
}

// POST /api/galleries
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createGallerySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    // Generate clean unique slug
    const baseSlug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
      : body.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const [gallery] = await db
      .insert(galleries)
      .values({
        organizationId: authCtx.orgId,
        title: body.title.trim(),
        slug: uniqueSlug,
        projectId: body.projectId || null,
        clientId: body.clientId || null,
        coverPhoto: body.coverPhoto || null,
        password: body.password || null,
        downloadPin: body.downloadPin || null,
        watermarkEnabled: body.watermarkEnabled,
        allowDownloads: body.allowDownloads,
        status: body.status || "published",
      })
      .returning();

    return NextResponse.json(gallery, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/galleries error:", err);
    return NextResponse.json({ error: "Failed to create gallery" }, { status: 500 });
  }
}
