import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { payments, invoices } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// GET /api/payments/verify/:reference
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const searchParams = request.nextUrl.searchParams;
    const isSimulated = searchParams.get("simulated") === "true";
    const invoiceIdParam = searchParams.get("invoiceId");

    // Handle dev simulated payment confirmation
    if (isSimulated && invoiceIdParam) {
      const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceIdParam));
      if (inv && inv.status !== "paid") {
        await db.insert(payments).values({
          organizationId: inv.organizationId,
          invoiceId: inv.id,
          clientId: inv.clientId,
          amount: inv.total,
          currency: inv.currency,
          provider: "paystack",
          providerReference: reference,
          providerStatus: "success",
          paidAt: new Date(),
        });

        const [updated] = await db
          .update(invoices)
          .set({
            status: "paid",
            amountPaid: inv.total,
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, inv.id))
          .returning();

        return NextResponse.json({ success: true, status: "success", invoice: updated });
      }
      return NextResponse.json({ success: true, status: "success", invoice: inv });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder";

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const verifyData = await paystackRes.json();

    if (verifyData.status && verifyData.data?.status === "success") {
      const data = verifyData.data;
      const invoiceId = data.metadata?.invoiceId;
      const organizationId = data.metadata?.organizationId;
      const clientId = data.metadata?.clientId;

      if (invoiceId) {
        // Record payment
        await db.insert(payments).values({
          organizationId,
          invoiceId,
          clientId: clientId || null,
          amount: String(data.amount / 100),
          currency: data.currency,
          provider: "paystack",
          providerReference: reference,
          providerStatus: "success",
          paidAt: new Date(),
        });

        // Update invoice
        const [updatedInvoice] = await db
          .update(invoices)
          .set({
            status: "paid",
            amountPaid: String(data.amount / 100),
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, invoiceId))
          .returning();

        return NextResponse.json({ success: true, status: "success", invoice: updatedInvoice });
      }
    }

    return NextResponse.json({ success: false, status: "pending", data: verifyData });
  } catch (err: any) {
    console.error("GET /api/payments/verify error:", err);
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 });
  }
}
