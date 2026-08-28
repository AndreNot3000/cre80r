import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { expenses, projects, members, organizations } from "@crea8or/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { createExpenseSchema } from "@crea8or/validators";

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

    if (membership) {
      orgId = membership.organizationId;
    } else {
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: `${session.user.name}'s Studio`,
          slug: `${session.user.name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString().slice(-4)}`,
          currency: "NGN",
        })
        .returning();
      orgId = newOrg.id;

      await db.insert(members).values({
        id: `mem_${Date.now()}`,
        organizationId: newOrg.id,
        userId: session.user.id,
        role: "owner",
      });
    }
  }

  return { user: session.user, orgId };
}

// GET /api/expenses — List expenses with filters
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const projectId = searchParams.get("projectId")?.trim();

    const conditions = [eq(expenses.organizationId, authCtx.orgId)];

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

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

// POST /api/expenses — Log new expense
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const body = await request.json();
    const validated = createExpenseSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const data = validated.data;

    const [created] = await db
      .insert(expenses)
      .values({
        organizationId: authCtx.orgId,
        projectId: data.projectId || null,
        category: data.category as any,
        description: data.description.trim(),
        vendor: data.vendor?.trim() || null,
        amount: data.amount.toString(),
        currency: (data.currency as any) || "NGN",
        receiptUrl: data.receiptUrl || null,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        paymentMethod: data.paymentMethod || "bank_transfer",
        isReimbursable: data.isReimbursable || false,
        isPaid: data.isPaid ?? true,
        notes: data.notes?.trim() || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
