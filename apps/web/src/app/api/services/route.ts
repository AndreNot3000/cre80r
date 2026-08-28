import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { services, organizations, members } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { createServiceSchema } from "@crea8or/validators";

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
  }

  return { user: session.user, orgId };
}

// GET /api/services
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const activeOnly = searchParams.get("activeOnly") === "true";

    const conditions = [eq(services.organizationId, authCtx.orgId)];

    if (activeOnly) {
      conditions.push(eq(services.isActive, true));
    }

    if (search) {
      conditions.push(
        or(
          ilike(services.name, `%${search}%`),
          ilike(services.description, `%${search}%`)
        )!
      );
    }

    const serviceList = await db
      .select()
      .from(services)
      .where(and(...conditions))
      .orderBy(desc(services.createdAt));

    return NextResponse.json(serviceList);
  } catch (err: any) {
    console.error("GET /api/services error:", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST /api/services
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createServiceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;
    const [service] = await db
      .insert(services)
      .values({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        basePrice: String(body.basePrice),
        currency: body.currency,
        durationHours: body.durationHours || null,
        isActive: body.isActive ?? true,
        addOns: body.addOns || null,
        organizationId: authCtx.orgId,
      })
      .returning();

    return NextResponse.json(service, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/services error:", err);
    return NextResponse.json({ error: "Failed to create service package" }, { status: 500 });
  }
}
