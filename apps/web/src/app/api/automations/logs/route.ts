import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@crea8or/db/client";
import { automationLogs, members } from "@crea8or/db/schema";
import { eq, desc } from "drizzle-orm";

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

  return { user: session.user, orgId };
}

// GET /api/automations/logs — Fetch recent execution activity logs
export async function GET() {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const logs = await db
      .select()
      .from(automationLogs)
      .where(eq(automationLogs.organizationId, authCtx.orgId))
      .orderBy(desc(automationLogs.createdAt))
      .limit(20);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/automations/logs error:", error);
    return NextResponse.json({ error: "Failed to fetch automation logs" }, { status: 500 });
  }
}
