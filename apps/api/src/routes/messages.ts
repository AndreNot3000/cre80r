import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { messages, projects, clients } from "@crea8or/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createMessageSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const messageRoutes = factory.createApp();

// GET /api/messages — Get message thread
messageRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const projectId = c.req.query("projectId");
  const clientId = c.req.query("clientId");

  const conditions = [eq(messages.organizationId, org.id)];

  if (projectId) {
    conditions.push(eq(messages.projectId, projectId));
  } else if (clientId) {
    conditions.push(eq(messages.clientId, clientId));
  }

  const result = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(asc(messages.createdAt));

  return c.json(result);
});

// POST /api/messages — Send new message
messageRoutes.post("/", requireAuth, zValidator("json", createMessageSchema), async (c) => {
  const org = c.get("organization");
  const user = c.get("user");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");

  const [newMessage] = await db
    .insert(messages)
    .values({
      organizationId: org.id,
      projectId: body.projectId || null,
      clientId: body.clientId || null,
      senderId: user ? user.id : null,
      senderName: user ? user.name : "Studio Lead",
      senderRole: body.senderRole || "creator",
      senderAvatar: user ? (user as any).image : null,
      content: body.content.trim(),
      attachments: body.attachments || null,
    })
    .returning();

  return c.json(newMessage, 201);
});
