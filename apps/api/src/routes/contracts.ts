import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { contracts } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createContractSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const contractRoutes = factory.createApp();

// GET /api/contracts
contractRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const result = await db
    .select()
    .from(contracts)
    .where(eq(contracts.organizationId, org.id))
    .orderBy(desc(contracts.createdAt));
  return c.json(result);
});

// POST /api/contracts
contractRoutes.post("/", requireAuth, zValidator("json", createContractSchema), async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const body = c.req.valid("json");
  const contractNumber = `CT-${Date.now()}`;

  const [contract] = await db
    .insert(contracts)
    .values({
      contractNumber,
      content: body.content,
      status: body.status,
      clientId: body.clientId || null,
      projectId: body.projectId || null,
      quoteId: body.quoteId || null,
      organizationId: org.id,
    })
    .returning();

  return c.json(contract, 201);
});

// GET /api/contracts/:id
contractRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const [contract] = await db
    .select()
    .from(contracts)
    .where(and(eq(contracts.organizationId, org.id), eq(contracts.id, c.req.param("id") as string)));

  if (!contract) return c.json({ error: "Contract not found" }, 404);
  return c.json(contract);
});

// POST /api/contracts/:id/send
contractRoutes.post("/:id/send", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const [updated] = await db
    .update(contracts)
    .set({ status: "sent", updatedAt: new Date() })
    .where(and(eq(contracts.organizationId, org.id), eq(contracts.id, c.req.param("id") as string)))
    .returning();

  if (!updated) return c.json({ error: "Contract not found" }, 404);
  return c.json(updated);
});

// POST /api/contracts/:id/sign
contractRoutes.post("/:id/sign", async (c) => {
  const clientIp = c.req.header("x-forwarded-for") || "127.0.0.1";

  const [updated] = await db
    .update(contracts)
    .set({
      status: "signed",
      clientSignedAt: new Date(),
      clientSignatureIp: clientIp,
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, c.req.param("id") as string))
    .returning();

  if (!updated) return c.json({ error: "Contract not found" }, 404);
  return c.json(updated);
});
