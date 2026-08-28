import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { invoices, clients, payments } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createInvoiceSchema, updateInvoiceSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const invoiceRoutes = factory.createApp();

// GET /api/invoices — List invoices with client details and filters
invoiceRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const search = c.req.query("search")?.trim();
  const status = c.req.query("status")?.trim();

  const conditions = [eq(invoices.organizationId, org.id)];

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

  return c.json(result);
});

// POST /api/invoices — Create invoice with auto-math
invoiceRoutes.post("/", requireAuth, zValidator("json", createInvoiceSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");

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
      currency: body.currency || org.currency || "NGN",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes: body.notes?.trim() || null,
      clientId: body.clientId || null,
      projectId: body.projectId || null,
      bookingId: body.bookingId || null,
      organizationId: org.id,
    })
    .returning();

  return c.json(invoice, 201);
});

// GET /api/invoices/:id — Single invoice details
invoiceRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const invoiceId = c.req.param("id") as string;

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
    .where(and(eq(invoices.organizationId, org.id), eq(invoices.id, invoiceId)));

  if (!result) return c.json({ error: "Invoice not found" }, 404);
  return c.json(result);
});

// PATCH /api/invoices/:id — Update invoice
invoiceRoutes.patch("/:id", requireAuth, zValidator("json", updateInvoiceSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const invoiceId = c.req.param("id") as string;
  const body = c.req.valid("json");

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
    .where(and(eq(invoices.organizationId, org.id), eq(invoices.id, invoiceId)))
    .returning();

  if (!updated) return c.json({ error: "Invoice not found" }, 404);
  return c.json(updated);
});

// POST /api/invoices/:id/send
invoiceRoutes.post("/:id/send", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const invoiceId = c.req.param("id") as string;

  const [updated] = await db
    .update(invoices)
    .set({ status: "sent", updatedAt: new Date() })
    .where(and(eq(invoices.organizationId, org.id), eq(invoices.id, invoiceId)))
    .returning();

  if (!updated) return c.json({ error: "Invoice not found" }, 404);
  return c.json(updated);
});

// POST /api/invoices/:id/mark-paid — Manual 1-click mark as paid
invoiceRoutes.post("/:id/mark-paid", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const invoiceId = c.req.param("id") as string;

  const [current] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.organizationId, org.id), eq(invoices.id, invoiceId)));

  if (!current) return c.json({ error: "Invoice not found" }, 404);

  const [updated] = await db
    .update(invoices)
    .set({
      status: "paid",
      amountPaid: current.total,
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(invoices.organizationId, org.id), eq(invoices.id, invoiceId)))
    .returning();

  // Create payment ledger record
  await db.insert(payments).values({
    organizationId: org.id,
    invoiceId: current.id,
    clientId: current.clientId,
    amount: current.total,
    currency: current.currency,
    provider: "manual",
    providerReference: `MANUAL-${Date.now()}`,
    providerStatus: "success",
    paidAt: new Date(),
  });

  return c.json(updated);
});

// DELETE /api/invoices/:id
invoiceRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const invoiceId = c.req.param("id") as string;

  await db
    .delete(invoices)
    .where(and(eq(invoices.organizationId, org.id), eq(invoices.id, invoiceId)));

  return c.json({ success: true, message: "Invoice deleted successfully" });
});
