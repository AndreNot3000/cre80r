import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { leads } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";
import { updateLeadStageSchema } from "@crea8or/validators";

// PATCH /api/leads/:id/stage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: leadId } = await params;
    const json = await request.json();
    const parsed = updateLeadStageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const [updated] = await db
      .update(leads)
      .set({
        status: parsed.data.status,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/leads/:id/stage error:", err);
    return NextResponse.json({ error: "Failed to update lead stage" }, { status: 500 });
  }
}
