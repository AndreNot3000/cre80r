import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { callSheets, projects, clients, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import { createCallSheetSchema, updateCallSheetSchema } from "@crea8or/validators";

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

// GET /api/projects/:id/callsheet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: projectId } = await params;

    const [callSheet] = await db
      .select()
      .from(callSheets)
      .where(and(eq(callSheets.organizationId, authCtx.orgId), eq(callSheets.projectId, projectId)));

    if (!callSheet) {
      // Return 404 with project info so creator can initialize one
      const [project] = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          shootDate: projects.shootDate,
          clientName: clients.name,
          clientPhone: clients.phone,
        })
        .from(projects)
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .where(eq(projects.id, projectId));

      return NextResponse.json({ callSheet: null, project }, { status: 200 });
    }

    return NextResponse.json({ callSheet });
  } catch (err: any) {
    console.error("GET /api/projects/:id/callsheet error:", err);
    return NextResponse.json({ error: "Failed to fetch call sheet" }, { status: 500 });
  }
}

// POST /api/projects/:id/callsheet — Create Call Sheet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: projectId } = await params;
    const json = await request.json();
    const parsed = createCallSheetSchema.safeParse({ ...json, projectId });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [created] = await db
      .insert(callSheets)
      .values({
        organizationId: authCtx.orgId,
        projectId,
        title: body.title.trim(),
        shootDate: new Date(body.shootDate),
        generalCallTime: body.generalCallTime.trim(),
        locationName: body.locationName.trim(),
        locationAddress: body.locationAddress?.trim() || null,
        locationMapsUrl: body.locationMapsUrl?.trim() || null,
        parkingNotes: body.parkingNotes?.trim() || null,
        weatherForecast: body.weatherForecast?.trim() || null,
        nearestHospital: body.nearestHospital?.trim() || null,
        crew: body.crew,
        schedule: body.schedule,
        gearList: body.gearList || null,
        emergencyContacts: body.emergencyContacts || null,
        notes: body.notes?.trim() || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/projects/:id/callsheet error:", err);
    return NextResponse.json({ error: "Failed to create call sheet" }, { status: 500 });
  }
}

// PATCH /api/projects/:id/callsheet — Update Call Sheet
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const { id: projectId } = await params;
    const json = await request.json();
    const parsed = updateCallSheetSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const [updated] = await db
      .update(callSheets)
      .set({
        title: body.title ? body.title.trim() : undefined,
        shootDate: body.shootDate ? new Date(body.shootDate) : undefined,
        generalCallTime: body.generalCallTime ? body.generalCallTime.trim() : undefined,
        locationName: body.locationName ? body.locationName.trim() : undefined,
        locationAddress: body.locationAddress !== undefined ? body.locationAddress?.trim() || null : undefined,
        locationMapsUrl: body.locationMapsUrl !== undefined ? body.locationMapsUrl?.trim() || null : undefined,
        parkingNotes: body.parkingNotes !== undefined ? body.parkingNotes?.trim() || null : undefined,
        weatherForecast: body.weatherForecast !== undefined ? body.weatherForecast?.trim() || null : undefined,
        nearestHospital: body.nearestHospital !== undefined ? body.nearestHospital?.trim() || null : undefined,
        crew: body.crew !== undefined ? body.crew : undefined,
        schedule: body.schedule !== undefined ? body.schedule : undefined,
        gearList: body.gearList !== undefined ? body.gearList : undefined,
        emergencyContacts: body.emergencyContacts !== undefined ? body.emergencyContacts : undefined,
        notes: body.notes !== undefined ? body.notes?.trim() || null : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(callSheets.organizationId, authCtx.orgId), eq(callSheets.projectId, projectId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Call sheet not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/projects/:id/callsheet error:", err);
    return NextResponse.json({ error: "Failed to update call sheet" }, { status: 500 });
  }
}
