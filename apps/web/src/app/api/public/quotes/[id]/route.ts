import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { quotes, clients, organizations } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// GET /api/public/quotes/:id — Publicly accessible endpoint for clients to view proposals
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        studioName: organizations.name,
        studioCurrency: organizations.currency,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .leftJoin(organizations, eq(quotes.organizationId, organizations.id))
      .where(eq(quotes.id, quoteId));

    if (!result) {
      return NextResponse.json({ error: "Proposal not found or has been removed" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/public/quotes/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch proposal details" }, { status: 500 });
  }
}
