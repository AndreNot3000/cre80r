import { createFactory } from "hono/factory";
import { db } from "@crea8or/db/client";
import { expenses, projects, invoices, organizations } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createExpenseSchema, updateExpenseSchema } from "@crea8or/validators";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const factory = createFactory<AppEnv>();
export const expenseRoutes = factory.createApp();

// GET /api/expenses/pnl — Aggregated Studio P&L Analytics
expenseRoutes.get("/pnl", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  // 1. Gross Invoiced & Paid Revenue
  const invoiceStats = await db
    .select({
      totalInvoiced: sql<number>`COALESCE(SUM(total), 0)`,
      totalPaid: sql<number>`COALESCE(SUM(amount_paid), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(invoices)
    .where(eq(invoices.organizationId, org.id));

  const grossRevenue = Number(invoiceStats[0]?.totalPaid || 0);
  const totalInvoiced = Number(invoiceStats[0]?.totalInvoiced || 0);

  // 2. Total Studio Expenses
  const expenseStats = await db
    .select({
      totalExpenses: sql<number>`COALESCE(SUM(amount), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(eq(expenses.organizationId, org.id));

  const totalExpenses = Number(expenseStats[0]?.totalExpenses || 0);
  const netProfit = grossRevenue - totalExpenses;
  const netMarginPct = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  // 3. Category Breakdown
  const categoryBreakdown = await db
    .select({
      category: expenses.category,
      totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(eq(expenses.organizationId, org.id))
    .groupBy(expenses.category);

  // 4. Project Margins Breakdown
  const projectList = await db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
    })
    .from(projects)
    .where(eq(projects.organizationId, org.id));

  const projectMargins = await Promise.all(
    projectList.map(async (p) => {
      const pExp = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(expenses)
        .where(and(eq(expenses.organizationId, org.id), eq(expenses.projectId, p.id)));

      const pInv = await db
        .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
        .from(invoices)
        .where(and(eq(invoices.organizationId, org.id), eq(invoices.projectId, p.id)));

      const rev = Number(pInv[0]?.total || 0);
      const exp = Number(pExp[0]?.total || 0);
      const profit = rev - exp;
      const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;

      return {
        projectId: p.id,
        projectName: p.name,
        status: p.status,
        revenue: rev,
        expenses: exp,
        netProfit: profit,
        marginPct: margin,
      };
    })
  );

  return c.json({
    grossRevenue,
    totalInvoiced,
    totalExpenses,
    netProfit,
    netMarginPct,
    categoryBreakdown: categoryBreakdown.map((b) => ({
      category: b.category,
      total: Number(b.totalAmount),
      count: Number(b.count),
      percentage: totalExpenses > 0 ? Math.round((Number(b.totalAmount) / totalExpenses) * 100) : 0,
    })),
    projectMargins,
  });
});

// GET /api/expenses — List all expenses with filters
expenseRoutes.get("/", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);

  const search = c.req.query("search")?.trim();
  const category = c.req.query("category")?.trim();
  const projectId = c.req.query("projectId")?.trim();

  const conditions = [eq(expenses.organizationId, org.id)];

  if (category && category !== "all") {
    conditions.push(eq(expenses.category, category as any));
  }

  if (projectId && projectId !== "all") {
    conditions.push(eq(expenses.projectId, projectId));
  }

  if (search) {
    conditions.push(
      or(
        ilike(expenses.description, `%${search}%`),
        ilike(expenses.vendor, `%${search}%`),
        ilike(expenses.notes, `%${search}%`)
      )!
    );
  }

  const result = await db
    .select({
      id: expenses.id,
      category: expenses.category,
      description: expenses.description,
      vendor: expenses.vendor,
      amount: expenses.amount,
      currency: expenses.currency,
      receiptUrl: expenses.receiptUrl,
      expenseDate: expenses.expenseDate,
      paymentMethod: expenses.paymentMethod,
      isReimbursable: expenses.isReimbursable,
      isPaid: expenses.isPaid,
      notes: expenses.notes,
      createdAt: expenses.createdAt,
      projectId: expenses.projectId,
      projectName: projects.name,
    })
    .from(expenses)
    .leftJoin(projects, eq(expenses.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(desc(expenses.expenseDate));

  return c.json(result);
});

// POST /api/expenses — Create an expense
expenseRoutes.post(
  "/",
  requireAuth,
  zValidator("json", createExpenseSchema),
  async (c) => {
    const org = c.get("organization");
    if (!org) return c.json({ error: "Organization required" }, 400);

    const body = c.req.valid("json");

    const [created] = await db
      .insert(expenses)
      .values({
        organizationId: org.id,
        projectId: body.projectId || null,
        category: body.category as any,
        description: body.description.trim(),
        vendor: body.vendor?.trim() || null,
        amount: body.amount.toString(),
        currency: (body.currency as any) || org.currency || "NGN",
        receiptUrl: body.receiptUrl || null,
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
        paymentMethod: body.paymentMethod || "bank_transfer",
        isReimbursable: body.isReimbursable || false,
        isPaid: body.isPaid ?? true,
        notes: body.notes?.trim() || null,
      })
      .returning();

    return c.json(created, 201);
  }
);

// GET /api/expenses/:id — Get one expense
expenseRoutes.get("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);
  const id = c.req.param("id");
  if (!id) return c.json({ error: "Expense ID required" }, 400);

  const [found] = await db
    .select({
      id: expenses.id,
      category: expenses.category,
      description: expenses.description,
      vendor: expenses.vendor,
      amount: expenses.amount,
      currency: expenses.currency,
      receiptUrl: expenses.receiptUrl,
      expenseDate: expenses.expenseDate,
      paymentMethod: expenses.paymentMethod,
      isReimbursable: expenses.isReimbursable,
      isPaid: expenses.isPaid,
      notes: expenses.notes,
      createdAt: expenses.createdAt,
      projectId: expenses.projectId,
      projectName: projects.name,
    })
    .from(expenses)
    .leftJoin(projects, eq(expenses.projectId, projects.id))
    .where(and(eq(expenses.id, id), eq(expenses.organizationId, org.id)));

  if (!found) return c.json({ error: "Expense not found" }, 404);
  return c.json(found);
});

// PATCH /api/expenses/:id — Update expense
expenseRoutes.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateExpenseSchema),
  async (c) => {
    const org = c.get("organization");
    if (!org) return c.json({ error: "Organization required" }, 400);
    const id = c.req.param("id");
    if (!id) return c.json({ error: "Expense ID required" }, 400);
    const body = c.req.valid("json");

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (body.projectId !== undefined) updateData.projectId = body.projectId || null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.vendor !== undefined) updateData.vendor = body.vendor?.trim() || null;
    if (body.amount !== undefined) updateData.amount = body.amount.toString();
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.receiptUrl !== undefined) updateData.receiptUrl = body.receiptUrl || null;
    if (body.expenseDate !== undefined) updateData.expenseDate = new Date(body.expenseDate);
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.isReimbursable !== undefined) updateData.isReimbursable = body.isReimbursable;
    if (body.isPaid !== undefined) updateData.isPaid = body.isPaid;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, org.id)))
      .returning();

    if (!updated) return c.json({ error: "Expense not found" }, 404);
    return c.json(updated);
  }
);

// DELETE /api/expenses/:id — Delete expense
expenseRoutes.delete("/:id", requireAuth, async (c) => {
  const org = c.get("organization");
  if (!org) return c.json({ error: "Organization required" }, 400);
  const id = c.req.param("id");
  if (!id) return c.json({ error: "Expense ID required" }, 400);

  const [deleted] = await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.organizationId, org.id)))
    .returning();

  if (!deleted) return c.json({ error: "Expense not found" }, 404);
  return c.json({ success: true, deletedId: deleted.id });
});

