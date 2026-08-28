import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { quotes, clients, leads } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createQuoteSchema, updateQuoteSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const quoteRoutes = factory.createApp();

// GET /api/quotes — List quotes with search and client details
quoteRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const search = c.req.query("search")?.trim();
  const status = c.req.query("status")?.trim();

  const conditions = [eq(quotes.organizationId, org.id)];

  if (status && status !== "all") {
    conditions.push(eq(quotes.status, status as any));
  }

  if (search) {
    conditions.push(
      or(
        ilike(quotes.quoteNumber, `%${search}%`),
        ilike(quotes.notes, `%${search}%`)
      )!
    );
  }

  const result = await db
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
    })
    .from(quotes)
    .leftJoin(clients, eq(quotes.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(quotes.createdAt));

  return c.json(result);
});

// POST /api/quotes — Create new quote/proposal with server-side auto-math
quoteRoutes.post("/", requireAuth, zValidator("json", createQuoteSchema), async (c) => {
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
  const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;

  const [quote] = await db
    .insert(quotes)
    .values({
      quoteNumber,
      lineItems: body.lineItems.map((item) => ({
        ...item,
        total: Number(item.quantity) * Number(item.unitPrice),
      })),
      subtotal: String(subtotal),
      taxRate: String(taxRate),
      taxAmount: String(taxAmount),
      discountAmount: String(discountAmount),
      total: String(total),
      currency: body.currency || org.currency || "NGN",
      notes: body.notes?.trim() || null,
      terms: body.terms?.trim() || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      clientId: body.clientId || null,
      leadId: body.leadId || null,
      bookingId: body.bookingId || null,
      organizationId: org.id,
    })
    .returning();

  return c.json(quote, 201);
});

// GET /api/quotes/:id — Single quote details with client & lead info
quoteRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const quoteId = c.req.param("id") as string;
  if (!quoteId) return c.json({ error: "Quote ID required" }, 400);

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
    })
    .from(quotes)
    .leftJoin(clients, eq(quotes.clientId, clients.id))
    .where(and(eq(quotes.organizationId, org.id), eq(quotes.id, quoteId)));

  if (!result) return c.json({ error: "Quote not found" }, 404);
  return c.json(result);
});

// PATCH /api/quotes/:id — Update quote details and recompute totals
quoteRoutes.patch("/:id", requireAuth, zValidator("json", updateQuoteSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const quoteId = c.req.param("id") as string;
  if (!quoteId) return c.json({ error: "Quote ID required" }, 400);

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
    .update(quotes)
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
      taxRate: body.taxRate !== undefined ? String(body.taxRate) : undefined,
      discountAmount: body.discountAmount !== undefined ? String(body.discountAmount) : undefined,
      total: total !== undefined ? String(total) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(quotes.organizationId, org.id), eq(quotes.id, quoteId)))
    .returning();

  if (!updated) return c.json({ error: "Quote not found" }, 404);
  return c.json(updated);
});

// POST /api/quotes/:id/send — Mark quote as sent
quoteRoutes.post("/:id/send", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const quoteId = c.req.param("id") as string;
  if (!quoteId) return c.json({ error: "Quote ID required" }, 400);

  const [updated] = await db
    .update(quotes)
    .set({ status: "sent", updatedAt: new Date() })
    .where(and(eq(quotes.organizationId, org.id), eq(quotes.id, quoteId)))
    .returning();

  if (!updated) return c.json({ error: "Quote not found" }, 404);
  return c.json(updated);
});

// POST /api/quotes/:id/accept — Mark quote as accepted
quoteRoutes.post("/:id/accept", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const quoteId = c.req.param("id") as string;
  if (!quoteId) return c.json({ error: "Quote ID required" }, 400);

  const [updated] = await db
    .update(quotes)
    .set({ status: "accepted", acceptedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(quotes.organizationId, org.id), eq(quotes.id, quoteId)))
    .returning();

  if (!updated) return c.json({ error: "Quote not found" }, 404);
  return c.json(updated);
});

// DELETE /api/quotes/:id — Delete quote
quoteRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const quoteId = c.req.param("id") as string;
  if (!quoteId) return c.json({ error: "Quote ID required" }, 400);

  await db
    .delete(quotes)
    .where(and(eq(quotes.organizationId, org.id), eq(quotes.id, quoteId)));

  return c.json({ success: true, message: "Quote deleted successfully" });
});
