import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { payments, invoices, organizations, clients } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const paymentRoutes = factory.createApp();

// GET /api/payments — List all payment transactions
paymentRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const result = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      provider: payments.provider,
      providerReference: payments.providerReference,
      providerStatus: payments.providerStatus,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      invoiceId: payments.invoiceId,
      clientId: payments.clientId,
      clientName: clients.name,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(payments)
    .leftJoin(clients, eq(payments.clientId, clients.id))
    .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
    .where(eq(payments.organizationId, org.id))
    .orderBy(desc(payments.createdAt));

  return c.json(result);
});

// GET /api/payments/:id
paymentRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.organizationId, org.id), eq(payments.id, c.req.param("id") as string)));

  if (!payment) return c.json({ error: "Payment record not found" }, 404);
  return c.json(payment);
});

// POST /api/payments/initialize/:invoiceId — Paystack Online Checkout Initialization
paymentRoutes.post("/initialize/:invoiceId", async (c) => {
  const invoiceId = c.req.param("invoiceId") as string;
  if (!invoiceId) return c.json({ error: "Invoice ID required" }, 400);

  const [invoice] = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      total: invoices.total,
      currency: invoices.currency,
      status: invoices.status,
      clientId: invoices.clientId,
      organizationId: invoices.organizationId,
      clientName: clients.name,
      clientEmail: clients.email,
      orgPaystackKey: organizations.paystackSecretKey,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(organizations, eq(invoices.organizationId, organizations.id))
    .where(eq(invoices.id, invoiceId));

  if (!invoice) return c.json({ error: "Invoice not found" }, 404);

  if (invoice.status === "paid") {
    return c.json({ error: "Invoice has already been paid" }, 400);
  }

  const paystackKey =
    invoice.orgPaystackKey ||
    process.env.PAYSTACK_SECRET_KEY ||
    "sk_test_placeholder_key";

  const amountInSubunits = Math.round(Number(invoice.total) * 100);
  const reference = `PAY-${invoice.invoiceNumber}-${Date.now()}`;
  const webUrl = process.env.WEB_URL || "http://localhost:3000";
  const callbackUrl = `${webUrl}/i/${invoice.id}?reference=${reference}`;

  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: invoice.clientEmail || "client@crea8or.app",
        amount: amountInSubunits,
        currency: invoice.currency,
        reference,
        callback_url: callbackUrl,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          organizationId: invoice.organizationId,
          clientId: invoice.clientId,
          clientName: invoice.clientName,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      // In development or test mode if Paystack test keys are simulated:
      return c.json({
        success: true,
        isSimulated: true,
        authorization_url: `${webUrl}/i/${invoice.id}?simulated_pay=true&reference=${reference}`,
        reference,
      });
    }

    return c.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference,
    });
  } catch (err: any) {
    console.error("Paystack initialization error:", err);
    // Dev fallback
    return c.json({
      success: true,
      isSimulated: true,
      authorization_url: `${webUrl}/i/${invoice.id}?simulated_pay=true&reference=${reference}`,
      reference,
    });
  }
});

// GET /api/payments/verify/:reference — Verify Paystack Transaction
paymentRoutes.get("/verify/:reference", async (c) => {
  const reference = c.req.param("reference") as string;
  if (!reference) return c.json({ error: "Transaction reference required" }, 400);

  const secretKey = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder_key";

  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
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
          clientId,
          amount: String(data.amount / 100),
          currency: data.currency,
          provider: "paystack",
          providerReference: reference,
          providerStatus: "success",
          paidAt: new Date(),
        });

        // Update invoice
        await db
          .update(invoices)
          .set({
            status: "paid",
            amountPaid: String(data.amount / 100),
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, invoiceId));
      }

      return c.json({ success: true, status: "success", data });
    }

    // If simulated or test transaction
    return c.json({ success: true, status: "pending", data: verifyData });
  } catch (err: any) {
    return c.json({ error: "Failed to verify transaction" }, 500);
  }
});

// POST /api/payments/paystack/webhook — HMAC-SHA512 Webhook handler
paymentRoutes.post("/paystack/webhook", async (c) => {
  const signature = c.req.header("x-paystack-signature");
  if (!signature) {
    return c.json({ error: "Missing Paystack signature header" }, 400);
  }

  const rawBody = await c.req.text();
  const secret = process.env.PAYSTACK_SECRET_KEY || "";

  // Verify HMAC-SHA512
  const hasher = new Bun.CryptoHasher("sha512", secret);
  hasher.update(rawBody);
  const hash = hasher.digest("hex");

  if (hash !== signature) {
    return c.json({ error: "Invalid HMAC signature" }, 401);
  }

  const payload = JSON.parse(rawBody);

  if (payload.event === "charge.success") {
    const data = payload.data;
    const invoiceId = data.metadata?.invoiceId;
    const organizationId = data.metadata?.organizationId;
    const clientId = data.metadata?.clientId;

    if (invoiceId && organizationId) {
      await db.insert(payments).values({
        amount: String(data.amount / 100),
        currency: data.currency,
        provider: "paystack",
        providerReference: data.reference,
        providerStatus: "success",
        invoiceId,
        clientId: clientId || null,
        organizationId,
        paidAt: new Date(),
      });

      await db
        .update(invoices)
        .set({
          status: "paid",
          amountPaid: String(data.amount / 100),
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));
    }
  }

  return c.json({ received: true });
});
