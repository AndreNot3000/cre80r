import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { leads, clients, projects, members } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// POST /api/leads/:id/convert
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orgId = (session.session as any)?.activeOrganizationId || (session.user as any)?.organizationId;

    if (!orgId) {
      const [membership] = await db
        .select()
        .from(members)
        .where(eq(members.userId, session.user.id));
      if (membership) orgId = membership.organizationId;
    }

    const { id: leadId } = await params;

    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId));

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const targetOrgId = orgId || lead.organizationId;

    // 1. Create client if not linked
    let clientRecord: any = null;
    if (lead.clientId) {
      const [existing] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, lead.clientId));
      clientRecord = existing;
    }

    if (!clientRecord) {
      const [newClient] = await db
        .insert(clients)
        .values({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          notes: `Converted from lead (${lead.source || "inquiry"}): ${lead.message || ""}`,
          tags: [lead.serviceInterest || "General", "Converted Lead"],
          organizationId: targetOrgId,
        })
        .returning();
      clientRecord = newClient;
    }

    // 2. Update lead status to booked
    const [updatedLead] = await db
      .update(leads)
      .set({
        status: "booked",
        clientId: clientRecord.id,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, lead.id))
      .returning();

    // 3. Create initial project
    const [newProject] = await db
      .insert(projects)
      .values({
        name: `${lead.name} — ${lead.serviceInterest || "Shoot Project"}`,
        clientId: clientRecord.id,
        organizationId: targetOrgId,
        status: "pre_production",
        shootDate: lead.eventDate ? new Date(lead.eventDate) : null,
        description: lead.message || null,
        notes: lead.budget ? `Estimated Budget: ₦${lead.budget}` : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      client: clientRecord,
      project: newProject,
      lead: updatedLead,
    });
  } catch (err: any) {
    console.error("POST /api/leads/:id/convert error:", err);
    return NextResponse.json({ error: "Failed to convert lead" }, { status: 500 });
  }
}
