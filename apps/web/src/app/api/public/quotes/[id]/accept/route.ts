import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { quotes, invoices } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// POST /api/public/quotes/:id/accept — Public digital signature & acceptance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;
    const body = await request.json().catch(() => ({}));
    const signerName = body?.signerName?.trim();

    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId));

    if (!quote) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (quote.status === "accepted") {
      return NextResponse.json({
        success: true,
        message: "Proposal was already accepted",
        quote,
      });
    }

    // 1. Update quote to accepted
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        terms: quote.terms
          ? `${quote.terms}\n\n[Digitally Signed by: ${signerName || "Client"} on ${new Date().toISOString()}]`
          : `[Digitally Signed by: ${signerName || "Client"} on ${new Date().toISOString()}]`,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, quoteId))
      .returning();

    // 2. Automatically generate deposit invoice for this accepted quote
    const depositAmount = String(Math.round(Number(quote.total) * 0.5));
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const [createdInvoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        clientId: quote.clientId || null,
        organizationId: quote.organizationId,
        status: "sent",
        lineItems: [
          {
            description: `50% Initial Booking Deposit for Proposal ${quote.quoteNumber}`,
            quantity: 1,
            unitPrice: Number(depositAmount),
            total: Number(depositAmount),
          },
        ],
        subtotal: depositAmount,
        total: depositAmount,
        currency: quote.currency,
        notes: `50% deposit for proposal ${quote.quoteNumber}. Generated upon digital acceptance by ${signerName || "Client"}.`,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Proposal successfully accepted and signed!",
      quote: updatedQuote,
      invoice: createdInvoice,
    });
  } catch (err: any) {
    console.error("POST /api/public/quotes/:id/accept error:", err);
    return NextResponse.json({ error: "Failed to accept proposal" }, { status: 500 });
  }
}
