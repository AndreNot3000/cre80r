import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { quotes, clients, members, organizations } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { createQuoteSchema } from "@crea8or/validators";

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

// GET /api/quotes
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();

    const conditions = [eq(quotes.organizationId, authCtx.orgId)];

    if (status && status !== "all") {
      conditions.push(eq(quotes.status, status as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(quotes.quoteNumber, `%${search}%`),
          ilike(quotes.notes, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        status: quotes.status,
        subtotal: quotes.subtotal,
        taxRate: quotes.taxRate,
        taxAmount: quotes.taxAmount,
        discountAmount: quotes.discountAmount,
        total: quotes.total,
        currency: quotes.currency,
        lineItems: quotes.lineItems,
        notes: quotes.notes,
        terms: quotes.terms,
        expiresAt: quotes.expiresAt,
        acceptedAt: quotes.acceptedAt,
        createdAt: quotes.createdAt,
        clientId: quotes.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(quotes.createdAt));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/quotes error:", err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

// POST /api/quotes
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createQuoteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const subtotal = body.lineItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    );
    const taxRate = Number(body.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = Number(body.discountAmount || 0);
    const total = Math.max(0, subtotal + taxAmount - discountAmount);
    const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;

    const [quote] = await db
      .insert(quotes)
      .values({
        quoteNumber,
        lineItems: body.lineItems.map((item) => ({
          ...item,
          total: Number(item.quantity) * Number(item.unitPrice),
        })),
        subtotal: String(subtotal),
        taxRate: String(taxRate),
        taxAmount: String(taxAmount),
        discountAmount: String(discountAmount),
        total: String(total),
        currency: body.currency,
        notes: body.notes?.trim() || null,
        terms: body.terms?.trim() || null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        clientId: body.clientId || null,
        leadId: body.leadId || null,
        bookingId: body.bookingId || null,
        organizationId: authCtx.orgId,
      })
      .returning();

    return NextResponse.json(quote, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/quotes error:", err);
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
  }
}
