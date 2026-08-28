import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { leads, organizations, members } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { createLeadSchema } from "@crea8or/validators";

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

// GET /api/leads
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const source = searchParams.get("source")?.trim();

    const conditions = [eq(leads.organizationId, authCtx.orgId)];

    if (status && status !== "all") {
      conditions.push(eq(leads.status, status as any));
    }

    if (source && source !== "all") {
      conditions.push(eq(leads.source, source));
    }

    if (search) {
      conditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.phone, `%${search}%`),
          ilike(leads.serviceInterest, `%${search}%`)
        )!
      );
    }

    const leadList = await db
      .select()
      .from(leads)
      .where(and(...conditions))
      .orderBy(desc(leads.createdAt));

    return NextResponse.json(leadList);
  } catch (err: any) {
    console.error("GET /api/leads error:", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// POST /api/leads
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;
    const [lead] = await db
      .insert(leads)
      .values({
        name: body.name.trim(),
        email: body.email?.trim().toLowerCase() || null,
        phone: body.phone?.trim() || null,
        serviceInterest: body.serviceInterest?.trim() || null,
        eventDate: body.eventDate ? new Date(body.eventDate) : null,
        budget: body.budget ? String(body.budget) : null,
        currency: body.currency || "NGN",
        message: body.message?.trim() || null,
        status: body.status || "new",
        source: body.source || "inquiry_form",
        notes: body.notes?.trim() || null,
        clientId: body.clientId || null,
        organizationId: authCtx.orgId,
      })
      .returning();

    return NextResponse.json(lead, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/leads error:", err);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
