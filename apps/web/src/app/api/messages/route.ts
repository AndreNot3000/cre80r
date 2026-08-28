import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { messages, projects, clients, members, organizations } from "@crea8or/db/schema";
import { eq, and, desc, or, asc } from "drizzle-orm";
import { createMessageSchema } from "@crea8or/validators";

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
      const [existingOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, session.user.id.toLowerCase().slice(0, 16)));

      if (existingOrg) {
        orgId = existingOrg.id;
      }
    }
  }

  return { user: session.user, orgId };
}

// GET /api/messages?projectId=...&clientId=...
export async function GET(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");

    const conditions = [eq(messages.organizationId, authCtx.orgId)];

    if (projectId) {
      conditions.push(eq(messages.projectId, projectId));
    } else if (clientId) {
      conditions.push(eq(messages.clientId, clientId));
    }

    const messageList = await db
      .select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json(messageList);
  } catch (err: any) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/messages — Send a new message
export async function POST(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const json = await request.json();
    const parsed = createMessageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [newMessage] = await db
      .insert(messages)
      .values({
        organizationId: authCtx.orgId,
        projectId: body.projectId || null,
        clientId: body.clientId || null,
        senderId: authCtx.user.id,
        senderName: authCtx.user.name || "Studio Lead",
        senderRole: body.senderRole || "creator",
        senderAvatar: (authCtx.user as any)?.image || null,
        content: body.content.trim(),
        attachments: body.attachments || null,
      })
      .returning();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
