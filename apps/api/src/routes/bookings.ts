import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { bookings } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createBookingSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const bookingRoutes = factory.createApp();

// GET /api/bookings
bookingRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.organizationId, org.id))
    .orderBy(desc(bookings.eventDate));
  return c.json(result);
});

// POST /api/bookings
bookingRoutes.post("/", requireAuth, zValidator("json", createBookingSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");

  const [booking] = await db
    .insert(bookings)
    .values({
      eventDate: new Date(body.eventDate),
      eventEndDate: body.eventEndDate ? new Date(body.eventEndDate) : null,
      location: body.location || null,
      notes: body.notes || null,
      totalAmount: body.totalAmount ? String(body.totalAmount) : null,
      currency: body.currency,
      status: body.status,
      clientId: body.clientId || null,
      serviceId: body.serviceId || null,
      leadId: body.leadId || null,
      organizationId: org.id,
    })
    .returning();

  return c.json(booking, 201);
});

// GET /api/bookings/:id
bookingRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.organizationId, org.id), eq(bookings.id, c.req.param("id") as string)));

  if (!booking) return c.json({ error: "Booking not found" }, 404);
  return c.json(booking);
});

// PATCH /api/bookings/:id
bookingRoutes.patch("/:id", requireAuth, zValidator("json", createBookingSchema.partial()), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");

  const [updated] = await db
    .update(bookings)
    .set({
      ...body,
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      eventEndDate: body.eventEndDate ? new Date(body.eventEndDate) : undefined,
      totalAmount: body.totalAmount ? String(body.totalAmount) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(bookings.organizationId, org.id), eq(bookings.id, c.req.param("id") as string)))
    .returning();

  if (!updated) return c.json({ error: "Booking not found" }, 404);
  return c.json(updated);
});

// DELETE /api/bookings/:id
bookingRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  await db
    .delete(bookings)
    .where(and(eq(bookings.organizationId, org.id), eq(bookings.id, c.req.param("id") as string)));

  return c.json({ success: true });
});
