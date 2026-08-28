import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { leads, clients, projects } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createLeadSchema, updateLeadSchema, updateLeadStageSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const leadRoutes = factory.createApp();

// GET /api/leads — List all leads for organization with search, stage filtering, and pipeline metrics
leadRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const search = c.req.query("search")?.trim();
  const status = c.req.query("status")?.trim();
  const source = c.req.query("source")?.trim();

  const conditions = [eq(leads.organizationId, org.id)];

  if (status && status !== "all") {
    conditions.push(eq(leads.status, status as any));
  }

  if (source && source !== "all") {
    conditions.push(eq(leads.source, source));
  }

  if (search) {
    conditions.push(
      or(
        ilike(leads.name, `%${search}%`),
        ilike(leads.email, `%${search}%`),
        ilike(leads.phone, `%${search}%`),
        ilike(leads.serviceInterest, `%${search}%`)
      )!
    );
  }

  const leadList = await db
    .select()
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt));

  return c.json(leadList);
});

// POST /api/leads — Create new lead / inquiry (authenticated or public booking form)
leadRoutes.post("/", zValidator("json", createLeadSchema), async (c) => {
  const body = c.req.valid("json");
  const authHeader = c.req.header("Authorization");
  let orgId = c.req.header("x-organization-id");

  if (authHeader) {
    const org = c.get("organization");
    if (org?.id) orgId = org.id;
  }

  if (!orgId) {
    return c.json({ error: "Missing organization identifier" }, 400);
  }

  const [lead] = await db
    .insert(leads)
    .values({
      name: body.name.trim(),
      email: body.email?.trim().toLowerCase() || null,
      phone: body.phone?.trim() || null,
      serviceInterest: body.serviceInterest?.trim() || null,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      budget: body.budget ? String(body.budget) : null,
      currency: body.currency || "NGN",
      message: body.message?.trim() || null,
      status: body.status || "new",
      source: body.source || "inquiry_form",
      notes: body.notes?.trim() || null,
      clientId: body.clientId || null,
      organizationId: orgId,
    })
    .returning();

  return c.json(lead, 201);
});

// GET /api/leads/:id — Single lead details
leadRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const leadId = c.req.param("id") as string;
  if (!leadId) return c.json({ error: "Lead ID required" }, 400);

  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.organizationId, org.id), eq(leads.id, leadId)));

  if (!lead) return c.json({ error: "Lead not found" }, 404);
  return c.json(lead);
});

// PATCH /api/leads/:id — Update lead details
leadRoutes.patch("/:id", requireAuth, zValidator("json", updateLeadSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const leadId = c.req.param("id") as string;
  if (!leadId) return c.json({ error: "Lead ID required" }, 400);
  const body = c.req.valid("json");

  const [updated] = await db
    .update(leads)
    .set({
      ...body,
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      budget: body.budget ? String(body.budget) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(leads.organizationId, org.id), eq(leads.id, leadId)))
    .returning();

  if (!updated) return c.json({ error: "Lead not found" }, 404);
  return c.json(updated);
});

// PATCH /api/leads/:id/stage — Quick stage transition (Kanban drag-and-drop)
leadRoutes.patch("/:id/stage", requireAuth, zValidator("json", updateLeadStageSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const leadId = c.req.param("id") as string;
  if (!leadId) return c.json({ error: "Lead ID required" }, 400);
  const { status } = c.req.valid("json");

  const [updated] = await db
    .update(leads)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(leads.organizationId, org.id), eq(leads.id, leadId)))
    .returning();

  if (!updated) return c.json({ error: "Lead not found" }, 404);
  return c.json(updated);
});

// POST /api/leads/:id/convert — Convert Lead into a Client & Project
leadRoutes.post("/:id/convert", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const leadId = c.req.param("id") as string;
  if (!leadId) return c.json({ error: "Lead ID required" }, 400);

  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.organizationId, org.id), eq(leads.id, leadId)));

  if (!lead) return c.json({ error: "Lead not found" }, 404);

  // 1. Create client if not already linked
  let clientRecord: any = null;
  if (lead.clientId) {
    const [existingClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, lead.clientId));
    clientRecord = existingClient;
  }

  if (!clientRecord) {
    const [newClient] = await db
      .insert(clients)
      .values({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        notes: `Converted from lead (${lead.source || "inquiry"}): ${lead.message || ""}`,
        tags: [lead.serviceInterest || "General", "Converted Lead"],
        organizationId: org.id,
      })
      .returning();
    clientRecord = newClient;
  }

  // 2. Update lead status to booked and link clientId
  const [updatedLead] = await db
    .update(leads)
    .set({
      status: "booked",
      clientId: clientRecord.id,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, lead.id))
    .returning();

  // 3. Create initial project
  const [newProject] = await db
    .insert(projects)
    .values({
      name: `${lead.name} — ${lead.serviceInterest || "Shoot Project"}`,
      clientId: clientRecord.id,
      organizationId: org.id,
      status: "pre_production",
      shootDate: lead.eventDate ? new Date(lead.eventDate) : null,
      description: lead.message || null,
      notes: lead.budget ? `Estimated Budget: ₦${lead.budget}` : null,
    })
    .returning();

  return c.json({
    success: true,
    client: clientRecord,
    project: newProject,
    lead: updatedLead,
  });
});

// DELETE /api/leads/:id — Delete lead
leadRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const leadId = c.req.param("id") as string;
  if (!leadId) return c.json({ error: "Lead ID required" }, 400);

  await db
    .delete(leads)
    .where(and(eq(leads.organizationId, org.id), eq(leads.id, leadId)));

  return c.json({ success: true, message: "Lead deleted successfully" });
});
