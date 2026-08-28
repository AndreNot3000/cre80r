import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { invoices } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";

// POST /api/invoices/:id/send
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

    const { id: invoiceId } = await params;

    const [updated] = await db
      .update(invoices)
      .set({
        status: "sent",
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("POST /api/invoices/:id/send error:", err);
    return NextResponse.json({ error: "Failed to mark invoice as sent" }, { status: 500 });
  }
}
