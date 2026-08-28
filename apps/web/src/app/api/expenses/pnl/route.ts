import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { expenses, projects, invoices, members } from "@crea8or/db/schema";
import { eq, and, sql } from "drizzle-orm";

async function getAuthContext() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  let orgId = (session.session as any)?.activeOrganizationId || (session.user as any)?.organizationId;

  if (!orgId) {
    const [membership] = await db
      .select()
      .from(members)
      .where(eq(members.userId, session.user.id));
    if (membership) orgId = membership.organizationId;
  }

  if (!orgId) {
    return { error: "Organization not found", status: 400 };
  }

  return { user: session.user, orgId };
}

// GET /api/expenses/pnl — Aggregated Studio P&L Metrics
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    // 1. Gross Invoiced & Paid Revenue
    const invoiceStats = await db
      .select({
        totalInvoiced: sql<number>`COALESCE(SUM(total), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(amount_paid), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(invoices)
      .where(eq(invoices.organizationId, authCtx.orgId));

    const totalInvoiced = Number(invoiceStats[0]?.totalInvoiced || 0);
    const grossRevenue = Number(invoiceStats[0]?.totalPaid || 0);

    // 2. Total Studio Expenses
    const expenseStats = await db
      .select({
        totalExpenses: sql<number>`COALESCE(SUM(amount), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(eq(expenses.organizationId, authCtx.orgId));

    const totalExpenses = Number(expenseStats[0]?.totalExpenses || 0);
    // If grossRevenue is 0 (new account with no paid invoices yet), calculate against invoiced or total
    const revenueBase = grossRevenue > 0 ? grossRevenue : totalInvoiced;
    const netProfit = revenueBase - totalExpenses;
    const netMarginPct = revenueBase > 0 ? Math.round((netProfit / revenueBase) * 100) : 0;

    // 3. Category Breakdown
    const categoryBreakdown = await db
      .select({
        category: expenses.category,
        totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(eq(expenses.organizationId, authCtx.orgId))
      .groupBy(expenses.category);

    // 4. Project Margins Breakdown
    const projectList = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
      })
      .from(projects)
      .where(eq(projects.organizationId, authCtx.orgId));

    const projectMargins = await Promise.all(
      projectList.map(async (p) => {
        const pExp = await db
          .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(expenses)
          .where(and(eq(expenses.organizationId, authCtx.orgId), eq(expenses.projectId, p.id)));

        const pInv = await db
          .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
          .from(invoices)
          .where(and(eq(invoices.organizationId, authCtx.orgId), eq(invoices.projectId, p.id)));

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

    return NextResponse.json({
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
  } catch (error) {
    console.error("GET /api/expenses/pnl error:", error);
    return NextResponse.json({ error: "Failed to fetch P&L metrics" }, { status: 500 });
  }
}
