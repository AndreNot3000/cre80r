import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { invoices, clients, organizations } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// GET /api/public/invoices/:id — Public client invoice viewing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        studioName: organizations.name,
        studioPhone: organizations.phone,
        studioCurrency: organizations.currency,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(organizations, eq(invoices.organizationId, organizations.id))
      .where(eq(invoices.id, invoiceId));

    if (!result) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/public/invoices/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}
