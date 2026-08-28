import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { projects, clients, bookings } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
} from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const projectRoutes = factory.createApp();

// GET /api/projects — List all projects for organization
projectRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const search = c.req.query("search")?.trim();
  const status = c.req.query("status")?.trim();

  const conditions = [eq(projects.organizationId, org.id)];

  if (status && status !== "all") {
    conditions.push(eq(projects.status, status as any));
  }

  if (search) {
    conditions.push(
      or(
        ilike(projects.name, `%${search}%`),
        ilike(projects.description, `%${search}%`),
        ilike(projects.notes, `%${search}%`)
      )!
    );
  }

  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      coverImage: projects.coverImage,
      shootDate: projects.shootDate,
      deliveryDate: projects.deliveryDate,
      notes: projects.notes,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      clientId: projects.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      bookingId: projects.bookingId,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt));

  return c.json(result);
});

// POST /api/projects — Create new project
projectRoutes.post("/", requireAuth, zValidator("json", createProjectSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");

  const [project] = await db
    .insert(projects)
    .values({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      clientId: body.clientId || null,
      bookingId: body.bookingId || null,
      status: body.status || "pre_production",
      coverImage: body.coverImage || null,
      shootDate: body.shootDate ? new Date(body.shootDate) : null,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      notes: body.notes?.trim() || null,
      organizationId: org.id,
    })
    .returning();

  return c.json(project, 201);
});

// GET /api/projects/:id — Single project details
projectRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const projectId = c.req.param("id") as string;

  const [result] = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      coverImage: projects.coverImage,
      shootDate: projects.shootDate,
      deliveryDate: projects.deliveryDate,
      notes: projects.notes,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      clientId: projects.clientId,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      clientAddress: clients.address,
      clientCity: clients.city,
      bookingId: projects.bookingId,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.organizationId, org.id), eq(projects.id, projectId)));

  if (!result) return c.json({ error: "Project not found" }, 404);
  return c.json(result);
});

// PATCH /api/projects/:id — Update project details
projectRoutes.patch("/:id", requireAuth, zValidator("json", updateProjectSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const projectId = c.req.param("id") as string;
  const body = c.req.valid("json");

  const [updated] = await db
    .update(projects)
    .set({
      name: body.name ? body.name.trim() : undefined,
      description: body.description !== undefined ? (body.description ? body.description.trim() : null) : undefined,
      status: body.status,
      coverImage: body.coverImage !== undefined ? body.coverImage : undefined,
      shootDate: body.shootDate !== undefined ? (body.shootDate ? new Date(body.shootDate) : null) : undefined,
      deliveryDate: body.deliveryDate !== undefined ? (body.deliveryDate ? new Date(body.deliveryDate) : null) : undefined,
      notes: body.notes !== undefined ? (body.notes ? body.notes.trim() : null) : undefined,
      clientId: body.clientId !== undefined ? body.clientId : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.organizationId, org.id), eq(projects.id, projectId)))
    .returning();

  if (!updated) return c.json({ error: "Project not found" }, 404);
  return c.json(updated);
});

// PATCH /api/projects/:id/status — Quick status advance
projectRoutes.patch("/:id/status", requireAuth, zValidator("json", updateProjectStatusSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const projectId = c.req.param("id") as string;
  const { status } = c.req.valid("json");

  const [updated] = await db
    .update(projects)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.organizationId, org.id), eq(projects.id, projectId)))
    .returning();

  if (!updated) return c.json({ error: "Project not found" }, 404);
  return c.json(updated);
});

// DELETE /api/projects/:id — Delete project
projectRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const projectId = c.req.param("id") as string;

  await db
    .delete(projects)
    .where(and(eq(projects.organizationId, org.id), eq(projects.id, projectId)));

  return c.json({ success: true, message: "Project deleted successfully" });
});
