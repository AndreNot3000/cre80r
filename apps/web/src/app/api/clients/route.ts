import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { clients, projects, invoices, organizations, members } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc, asc, sql } from "drizzle-orm";
import { createClientSchema } from "@crea8or/validators";

async function getAuthContext() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  // Resolve organization ID
  let orgId = (session.session as any)?.activeOrganizationId || (session.user as any)?.organizationId;

  if (!orgId) {
    // Check if user has an organization membership
    const [membership] = await db
      .select()
      .from(members)
      .where(eq(members.userId, session.user.id));

    if (membership) {
      orgId = membership.organizationId;
    } else {
      // Find or create default personal studio workspace
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

  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId));

  return { user: session.user, organization: org || { id: orgId, currency: "NGN" } };
}

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const sortOrder = searchParams.get("order") || "desc";

    const conditions = [
      eq(clients.organizationId, authCtx.organization.id),
      eq(clients.isArchived, false),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(clients.name, `%${search}%`),
          ilike(clients.email, `%${search}%`),
          ilike(clients.phone, `%${search}%`),
          ilike(clients.city, `%${search}%`)
        )!
      );
    }

    const clientList = await db
      .select()
      .from(clients)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(clients.createdAt) : desc(clients.createdAt));

    // Enrich with projects count and lifetime spend
    const enrichedClients = await Promise.all(
      clientList.map(async (client) => {
        const [projResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(projects)
          .where(
            and(
              eq(projects.clientId, client.id),
              eq(projects.organizationId, authCtx.organization.id)
            )
          );

        const [invoiceResult] = await db
          .select({
            totalSpent: sql<string>`coalesce(sum(${invoices.amountPaid}), 0)::text`,
          })
          .from(invoices)
          .where(
            and(
              eq(invoices.clientId, client.id),
              eq(invoices.organizationId, authCtx.organization.id),
              eq(invoices.status, "paid")
            )
          );

        return {
          ...client,
          projectsCount: projResult?.count || 0,
          lifetimeSpend: Number(invoiceResult?.totalSpent || 0),
          currency: authCtx.organization.currency || "NGN",
        };
      })
    );

    return NextResponse.json(enrichedClients);
  } catch (err: any) {
    console.error("GET /api/clients error:", err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createClientSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;
    const [client] = await db
      .insert(clients)
      .values({
        name: body.name.trim(),
        email: body.email?.trim().toLowerCase() || null,
        phone: body.phone?.trim() || null,
        instagram: body.instagram?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        country: body.country?.trim() || "Nigeria",
        notes: body.notes?.trim() || null,
        tags: body.tags || [],
        organizationId: authCtx.organization.id,
      })
      .returning();

    return NextResponse.json(
      {
        ...client,
        projectsCount: 0,
        lifetimeSpend: 0,
        currency: authCtx.organization.currency || "NGN",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/clients error:", err);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
