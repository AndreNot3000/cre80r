import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { invoices, clients, members } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { createInvoiceSchema } from "@crea8or/validators";

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

// GET /api/invoices
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();

    const conditions = [eq(invoices.organizationId, authCtx.orgId)];

    if (status && status !== "all") {
      conditions.push(eq(invoices.status, status as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(invoices.invoiceNumber, `%${search}%`),
          ilike(invoices.notes, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        discountAmount: invoices.discountAmount,
        total: invoices.total,
        amountPaid: invoices.amountPaid,
        currency: invoices.currency,
        lineItems: invoices.lineItems,
        notes: invoices.notes,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/invoices error:", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST /api/invoices
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createInvoiceSchema.safeParse(json);

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
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        lineItems: body.lineItems.map((item) => ({
          ...item,
          total: Number(item.quantity) * Number(item.unitPrice),
        })),
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        discountAmount: String(discountAmount),
        total: String(total),
        amountPaid: "0",
        currency: body.currency,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes?.trim() || null,
        clientId: body.clientId || null,
        projectId: body.projectId || null,
        bookingId: body.bookingId || null,
        organizationId: authCtx.orgId,
      })
      .returning();

    return NextResponse.json(invoice, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/invoices error:", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
