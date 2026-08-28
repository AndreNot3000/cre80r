import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { invoices, payments } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// POST /api/invoices/:id/mark-paid
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    const [current] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId));

    if (!current) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(invoices)
      .set({
        status: "paid",
        amountPaid: current.total,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    // Record payment entry in ledger
    await db.insert(payments).values({
      organizationId: current.organizationId,
      invoiceId: current.id,
      clientId: current.clientId,
      amount: current.total,
      currency: current.currency,
      provider: "manual",
      providerReference: `MANUAL-${Date.now()}`,
      providerStatus: "success",
      paidAt: new Date(),
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("POST /api/invoices/:id/mark-paid error:", err);
    return NextResponse.json({ error: "Failed to mark invoice as paid" }, { status: 500 });
  }
}
