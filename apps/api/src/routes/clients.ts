import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { clients, projects, invoices } from "@crea8or/db/schema";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createClientSchema, updateClientSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const clientRoutes = factory.createApp();

// GET /api/clients — List clients with search, tag filtering, project counts, and lifetime spend
clientRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization context required" }, 400);

  const search = c.req.query("search")?.trim();
  const tag = c.req.query("tag")?.trim();
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortOrder = c.req.query("order") || "desc";

  // Build filter conditions
  const conditions = [
    eq(clients.organizationId, org.id),
    eq(clients.isArchived, false),
  ];

  if (search) {
    conditions.push(
      or(
        ilike(clients.name, `%${search}%`),
        ilike(clients.email, `%${search}%`),
        ilike(clients.phone, `%${search}%`),
        ilike(clients.city, `%${search}%`)
      )!
    );
  }

  // Fetch clients
  const clientList = await db
    .select()
    .from(clients)
    .where(and(...conditions))
    .orderBy(sortOrder === "asc" ? asc(clients.createdAt) : desc(clients.createdAt));

  // Compute live aggregates (projects count and lifetime spend) for each client
  const enrichedClients = await Promise.all(
    clientList.map(async (client) => {
      // 1. Projects Count
      const [projResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(and(eq(projects.clientId, client.id), eq(projects.organizationId, org.id)));

      // 2. Lifetime Spend (sum of paid invoices)
      const [invoiceResult] = await db
        .select({
          totalSpent: sql<string>`coalesce(sum(${invoices.amountPaid}), 0)::text`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.clientId, client.id),
            eq(invoices.organizationId, org.id),
            eq(invoices.status, "paid")
          )
        );

      return {
        ...client,
        projectsCount: projResult?.count || 0,
        lifetimeSpend: Number(invoiceResult?.totalSpent || 0),
        currency: org.currency || "NGN",
      };
    })
  );

  return c.json(enrichedClients);
});

// POST /api/clients — Create a new client
clientRoutes.post("/", requireAuth, zValidator("json", createClientSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization context required" }, 400);

  const body = c.req.valid("json");
  const [client] = await db
    .insert(clients)
    .values({
      name: body.name.trim(),
      email: body.email?.trim().toLowerCase() || null,
      phone: body.phone?.trim() || null,
      instagram: body.instagram?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city?.trim() || null,
      country: body.country?.trim() || "Nigeria",
      notes: body.notes?.trim() || null,
      tags: body.tags || [],
      organizationId: org.id,
    })
    .returning();

  return c.json(
    {
      ...client,
      projectsCount: 0,
      lifetimeSpend: 0,
      currency: org.currency || "NGN",
    },
    201
  );
});

// GET /api/clients/:id — Single client detail with past projects & invoice history
clientRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization context required" }, 400);

  const clientId = c.req.param("id") as string;
  if (!clientId) return c.json({ error: "Client ID required" }, 400);

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.organizationId, org.id), eq(clients.id, clientId)));

  if (!client) return c.json({ error: "Client not found" }, 404);

  // Fetch client projects
  const clientProjects = await db
    .select()
    .from(projects)
    .where(and(eq(projects.clientId, clientId), eq(projects.organizationId, org.id)))
    .orderBy(desc(projects.createdAt));

  // Fetch client invoices
  const clientInvoices = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.clientId, clientId), eq(invoices.organizationId, org.id)))
    .orderBy(desc(invoices.createdAt));

  const totalSpent = clientInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, curr) => acc + Number(curr.amountPaid || 0), 0);

  return c.json({
    ...client,
    projectsCount: clientProjects.length,
    lifetimeSpend: totalSpent,
    currency: org.currency || "NGN",
    projects: clientProjects,
    invoices: clientInvoices,
  });
});

// PATCH /api/clients/:id — Update client details
clientRoutes.patch("/:id", requireAuth, zValidator("json", updateClientSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization context required" }, 400);

  const clientId = c.req.param("id") as string;
  if (!clientId) return c.json({ error: "Client ID required" }, 400);
  const body = c.req.valid("json");

  const [updated] = await db
    .update(clients)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(and(eq(clients.organizationId, org.id), eq(clients.id, clientId)))
    .returning();

  if (!updated) return c.json({ error: "Client not found" }, 404);

  return c.json(updated);
});

// DELETE /api/clients/:id — Soft-delete / archive client
clientRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization context required" }, 400);

  const clientId = c.req.param("id") as string;
  if (!clientId) return c.json({ error: "Client ID required" }, 400);

  const [archived] = await db
    .update(clients)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(and(eq(clients.organizationId, org.id), eq(clients.id, clientId)))
    .returning();

  if (!archived) return c.json({ error: "Client not found" }, 404);

  return c.json({ success: true, message: "Client archived successfully" });
});
