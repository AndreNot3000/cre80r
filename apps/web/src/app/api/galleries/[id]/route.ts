import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { galleries, galleryPhotos, clients, projects, members } from "@crea8or/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { updateGallerySchema } from "@crea8or/validators";

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
    }
  }

  return { user: session.user, orgId };
}

// GET /api/galleries/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: galleryId } = await params;

    const [gallery] = await db
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
      })
      .from(galleries)
      .leftJoin(clients, eq(galleries.clientId, clients.id))
      .leftJoin(projects, eq(galleries.projectId, projects.id))
      .where(and(eq(galleries.organizationId, authCtx.orgId), eq(galleries.id, galleryId)));

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const photos = await db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.galleryId, galleryId))
      .orderBy(asc(galleryPhotos.sortOrder), asc(galleryPhotos.createdAt));

    return NextResponse.json({ ...gallery, photos });
  } catch (err: any) {
    console.error("GET /api/galleries/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

// PATCH /api/galleries/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: galleryId } = await params;
    const json = await request.json();
    const parsed = updateGallerySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [updated] = await db
      .update(galleries)
      .set({
        title: body.title !== undefined ? body.title.trim() : undefined,
        slug: body.slug !== undefined ? body.slug.trim() : undefined,
        coverPhoto: body.coverPhoto !== undefined ? body.coverPhoto : undefined,
        password: body.password !== undefined ? body.password : undefined,
        downloadPin: body.downloadPin !== undefined ? body.downloadPin : undefined,
        watermarkEnabled: body.watermarkEnabled !== undefined ? body.watermarkEnabled : undefined,
        allowDownloads: body.allowDownloads !== undefined ? body.allowDownloads : undefined,
        status: body.status !== undefined ? body.status : undefined,
        projectId: body.projectId !== undefined ? body.projectId : undefined,
        clientId: body.clientId !== undefined ? body.clientId : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(galleries.organizationId, authCtx.orgId), eq(galleries.id, galleryId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/galleries/:id error:", err);
    return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 });
  }
}

// DELETE /api/galleries/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: galleryId } = await params;

    const [deleted] = await db
      .delete(galleries)
      .where(and(eq(galleries.organizationId, authCtx.orgId), eq(galleries.id, galleryId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Gallery deleted" });
  } catch (err: any) {
    console.error("DELETE /api/galleries/:id error:", err);
    return NextResponse.json({ error: "Failed to delete gallery" }, { status: 500 });
  }
}
