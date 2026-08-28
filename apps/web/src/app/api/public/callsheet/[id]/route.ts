import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { callSheets, projects, clients, organizations } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// GET /api/public/callsheet/:id (public project or callsheet id)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;

    // Search by callsheet id or project id
    let [callSheet] = await db
      .select()
      .from(callSheets)
      .where(eq(callSheets.id, paramId));

    if (!callSheet) {
      [callSheet] = await db
        .select()
        .from(callSheets)
        .where(eq(callSheets.projectId, paramId));
    }

    if (!callSheet) {
      return NextResponse.json({ error: "Call sheet not found" }, { status: 404 });
    }

    const [project] = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        clientName: clients.name,
        clientPhone: clients.phone,
        orgName: organizations.name,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(organizations, eq(projects.organizationId, organizations.id))
      .where(eq(projects.id, callSheet.projectId));

    return NextResponse.json({ callSheet, project });
  } catch (err: any) {
    console.error("GET /api/public/callsheet/:id error:", err);
    return NextResponse.json({ error: "Failed to load public call sheet" }, { status: 500 });
  }
}
