import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { payments, invoices } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// POST /api/webhooks/paystack — Next.js Paystack Webhook Handler with HMAC-SHA512 Verification
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Paystack signature header" }, { status: 400 });
    }

    const rawBody = await request.text();
    const secret = process.env.PAYSTACK_SECRET_KEY || "";

    // Verify HMAC-SHA512 signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("⚠️ Paystack webhook HMAC verification failed");
      return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "charge.success") {
      const data = payload.data;
      const invoiceId = data.metadata?.invoiceId;
      const organizationId = data.metadata?.organizationId;
      const clientId = data.metadata?.clientId;
      const reference = data.reference;

      if (invoiceId && organizationId) {
        const paidAmount = String(data.amount / 100);

        // Check if payment already recorded
        const existingPayment = await db
          .select()
          .from(payments)
          .where(eq(payments.providerReference, reference));

        if (existingPayment.length === 0) {
          // 1. Record payment in ledger
          await db.insert(payments).values({
            organizationId,
            invoiceId,
            clientId: clientId || null,
            amount: paidAmount,
            currency: data.currency,
            provider: "paystack",
            providerReference: reference,
            providerStatus: "success",
            metadata: data,
            paidAt: new Date(data.paid_at || Date.now()),
          });

          // 2. Automatically update invoice status to paid
          await db
            .update(invoices)
            .set({
              status: "paid",
              amountPaid: paidAmount,
              paidAt: new Date(data.paid_at || Date.now()),
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoiceId));

          console.log(`✅ Webhook auto-reconciled: Invoice ${invoiceId} marked as PAID for ₦${paidAmount}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("POST /api/webhooks/paystack error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
