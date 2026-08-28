import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { services } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createServiceSchema, updateServiceSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const serviceRoutes = factory.createApp();

// GET /api/services — List packages with search & active filter
serviceRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const search = c.req.query("search")?.trim();
  const activeOnly = c.req.query("activeOnly") === "true";

  const conditions = [eq(services.organizationId, org.id)];

  if (activeOnly) {
    conditions.push(eq(services.isActive, true));
  }

  if (search) {
    conditions.push(
      or(
        ilike(services.name, `%${search}%`),
        ilike(services.description, `%${search}%`)
      )!
    );
  }

  const result = await db
    .select()
    .from(services)
    .where(and(...conditions))
    .orderBy(desc(services.createdAt));

  return c.json(result);
});

// POST /api/services — Create new service package
serviceRoutes.post("/", requireAuth, zValidator("json", createServiceSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");

  const [service] = await db
    .insert(services)
    .values({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      basePrice: String(body.basePrice),
      currency: body.currency || org.currency || "NGN",
      durationHours: body.durationHours || null,
      isActive: body.isActive ?? true,
      addOns: body.addOns || null,
      organizationId: org.id,
    })
    .returning();

  return c.json(service, 201);
});

// GET /api/services/:id — Single package detail
serviceRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const serviceId = c.req.param("id") as string;
  if (!serviceId) return c.json({ error: "Service ID required" }, 400);

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.organizationId, org.id), eq(services.id, serviceId)));

  if (!service) return c.json({ error: "Service package not found" }, 404);
  return c.json(service);
});

// PATCH /api/services/:id — Update package
serviceRoutes.patch("/:id", requireAuth, zValidator("json", updateServiceSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const serviceId = c.req.param("id") as string;
  if (!serviceId) return c.json({ error: "Service ID required" }, 400);

  const body = c.req.valid("json");

  const [updated] = await db
    .update(services)
    .set({
      ...body,
      basePrice: body.basePrice !== undefined ? String(body.basePrice) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(services.organizationId, org.id), eq(services.id, serviceId)))
    .returning();

  if (!updated) return c.json({ error: "Service package not found" }, 404);
  return c.json(updated);
});

// DELETE /api/services/:id — Delete package
serviceRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const serviceId = c.req.param("id") as string;
  if (!serviceId) return c.json({ error: "Service ID required" }, 400);

  await db
    .delete(services)
    .where(and(eq(services.organizationId, org.id), eq(services.id, serviceId)));

  return c.json({ success: true, message: "Service package deleted successfully" });
});
