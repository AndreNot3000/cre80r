import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { quotes, clients, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { updateQuoteSchema } from "@crea8or/validators";

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

// GET /api/quotes/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: quoteId } = await params;

    const [result] = await db
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
        clientPhone: clients.phone,
        clientCity: clients.city,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(eq(quotes.id, quoteId));

    if (!result) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/quotes/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}

// PATCH /api/quotes/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: quoteId } = await params;
    const json = await request.json();
    const parsed = updateQuoteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    let subtotal: number | undefined;
    let taxAmount: number | undefined;
    let total: number | undefined;

    if (body.lineItems) {
      subtotal = body.lineItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
        0
      );
      const taxRate = Number(body.taxRate || 0);
      taxAmount = (subtotal * taxRate) / 100;
      const discountAmount = Number(body.discountAmount || 0);
      total = Math.max(0, subtotal + taxAmount - discountAmount);
    }

    const [updated] = await db
      .update(quotes)
      .set({
        ...body,
        lineItems: body.lineItems
          ? body.lineItems.map((item) => ({
              ...item,
              total: Number(item.quantity) * Number(item.unitPrice),
            }))
          : undefined,
        subtotal: subtotal !== undefined ? String(subtotal) : undefined,
        taxAmount: taxAmount !== undefined ? String(taxAmount) : undefined,
        taxRate: body.taxRate !== undefined ? String(body.taxRate) : undefined,
        discountAmount: body.discountAmount !== undefined ? String(body.discountAmount) : undefined,
        total: total !== undefined ? String(total) : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, quoteId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/quotes/:id error:", err);
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

// DELETE /api/quotes/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: quoteId } = await params;

    const [deleted] = await db
      .delete(quotes)
      .where(eq(quotes.id, quoteId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Quote deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/quotes/:id error:", err);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}
