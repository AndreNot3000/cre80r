import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { projects, clients, messages, members, organizations } from "@crea8or/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

// GET /api/messages/channels — List active communication channels
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    // 1. Get all projects for org
    const projectList = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        clientId: projects.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.organizationId, authCtx.orgId))
      .orderBy(desc(projects.updatedAt));

    // 2. Get all clients for org
    const clientList = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        updatedAt: clients.updatedAt,
      })
      .from(clients)
      .where(eq(clients.organizationId, authCtx.orgId))
      .orderBy(desc(clients.updatedAt));

    return NextResponse.json({
      projects: projectList,
      clients: clientList,
    });
  } catch (err: any) {
    console.error("GET /api/messages/channels error:", err);
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }
}
