import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { expenses, projects, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { updateExpenseSchema } from "@crea8or/validators";

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

// GET /api/expenses/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id } = await params;

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
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, authCtx.orgId)));

    if (!found) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(found);
  } catch (error) {
    console.error("GET /api/expenses/:id error:", error);
    return NextResponse.json({ error: "Failed to fetch expense" }, { status: 500 });
  }
}

// PATCH /api/expenses/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateExpenseSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const data = validated.data;
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.projectId !== undefined) updateData.projectId = data.projectId || null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.vendor !== undefined) updateData.vendor = data.vendor?.trim() || null;
    if (data.amount !== undefined) updateData.amount = data.amount.toString();
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl || null;
    if (data.expenseDate !== undefined) updateData.expenseDate = new Date(data.expenseDate);
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.isReimbursable !== undefined) updateData.isReimbursable = data.isReimbursable;
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, authCtx.orgId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/expenses/:id error:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

// DELETE /api/expenses/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id } = await params;

    const [deleted] = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, authCtx.orgId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: deleted.id });
  } catch (error) {
    console.error("DELETE /api/expenses/:id error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
