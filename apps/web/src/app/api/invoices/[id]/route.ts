import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { invoices, clients, members } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";
import { updateInvoiceSchema } from "@crea8or/validators";

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

// GET /api/invoices/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: invoiceId } = await params;

    const [result] = await db
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
        clientAddress: clients.address,
        clientCity: clients.city,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.id, invoiceId));

    if (!result) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/invoices/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

// PATCH /api/invoices/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: invoiceId } = await params;
    const json = await request.json();
    const parsed = updateInvoiceSchema.safeParse(json);

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
      .update(invoices)
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
        discountAmount: body.discountAmount !== undefined ? String(body.discountAmount) : undefined,
        total: total !== undefined ? String(total) : undefined,
        amountPaid: body.amountPaid !== undefined ? String(body.amountPaid) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/invoices/:id error:", err);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

// DELETE /api/invoices/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: invoiceId } = await params;

    const [deleted] = await db
      .delete(invoices)
      .where(eq(invoices.id, invoiceId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/invoices/:id error:", err);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
