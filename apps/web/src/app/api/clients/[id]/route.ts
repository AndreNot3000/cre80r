import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { clients, projects, invoices, organizations, members } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { updateClientSchema } from "@crea8or/validators";

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
    }
  }

  return { user: session.user, orgId };
}

// GET /api/clients/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: clientId } = await params;

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId));

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch projects
    const clientProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.createdAt));

    // Fetch invoices
    const clientInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.createdAt));

    const totalSpent = clientInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((acc, curr) => acc + Number(curr.amountPaid || 0), 0);

    return NextResponse.json({
      ...client,
      projectsCount: clientProjects.length,
      lifetimeSpend: totalSpent,
      projects: clientProjects,
      invoices: clientInvoices,
    });
  } catch (err: any) {
    console.error("GET /api/clients/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch client details" }, { status: 500 });
  }
}

// PATCH /api/clients/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: clientId } = await params;
    const json = await request.json();
    const parsed = updateClientSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const [updated] = await db
      .update(clients)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/clients/:id error:", err);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// DELETE /api/clients/:id (Soft-delete / Archive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: clientId } = await params;

    const [archived] = await db
      .update(clients)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    if (!archived) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Client archived successfully" });
  } catch (err: any) {
    console.error("DELETE /api/clients/:id error:", err);
    return NextResponse.json({ error: "Failed to archive client" }, { status: 500 });
  }
}
