import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { projects, clients, members, organizations } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { createProjectSchema } from "@crea8or/validators";

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
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: `${session.user.name}'s Studio`,
          slug: `${session.user.name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString().slice(-4)}`,
          currency: "NGN",
        })
        .returning();
      orgId = newOrg.id;

      await db.insert(members).values({
        id: `mem_${Date.now()}`,
        organizationId: newOrg.id,
        userId: session.user.id,
        role: "owner",
      });
    }
  }

  return { user: session.user, orgId };
}

// GET /api/projects
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();

    const conditions = [eq(projects.organizationId, authCtx.orgId)];

    if (status && status !== "all") {
      conditions.push(eq(projects.status, status as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(projects.name, `%${search}%`),
          ilike(projects.description, `%${search}%`),
          ilike(projects.notes, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        coverImage: projects.coverImage,
        shootDate: projects.shootDate,
        deliveryDate: projects.deliveryDate,
        notes: projects.notes,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientId: projects.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        bookingId: projects.bookingId,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createProjectSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [project] = await db
      .insert(projects)
      .values({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        clientId: body.clientId || null,
        bookingId: body.bookingId || null,
        status: body.status || "pre_production",
        coverImage: body.coverImage || null,
        shootDate: body.shootDate ? new Date(body.shootDate) : null,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        notes: body.notes?.trim() || null,
        organizationId: authCtx.orgId,
      })
      .returning();

    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
