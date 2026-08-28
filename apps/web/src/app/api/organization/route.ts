import { auth } from "@crea8or/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@crea8or/db/client";
import { organizations, members, users } from "@crea8or/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().min(1, "Studio name is required").optional(),
  slug: z.string().min(1, "Studio slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and dashes").optional(),
  tagline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  currency: z.enum(["NGN", "USD", "GHS", "KES", "ZAR", "GBP"]).optional(),
  instagram: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  heroShowreelUrl: z.string().nullable().optional(),
  heroPosterUrl: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
});

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
    // Look up or create default org for this user
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: `${session.user.name}'s Studio`,
        slug: `${session.user.name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString().slice(-4)}`,
        currency: "NGN",
      })
      .returning();
    orgId = newOrg.id;

    await db.insert(members).values({
      id: `mem_${Date.now()}`,
      organizationId: newOrg.id,
      userId: session.user.id,
      role: "owner",
    });
  }

  return { user: session.user, orgId };
}

// GET /api/organization — Get current user's studio profile
export async function GET() {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, authCtx.orgId));

    if (!org) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error("GET /api/organization error:", error);
    return NextResponse.json({ error: "Failed to fetch studio profile" }, { status: 500 });
  }
}

// PATCH /api/organization — Update studio profile & branding
export async function PATCH(request: NextRequest) {
  try {
    const authCtx = await getAuthContext();
    if ("error" in authCtx) {
      return NextResponse.json({ error: authCtx.error }, { status: authCtx.status });
    }

    const body = await request.json();
    const validated = updateOrgSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const data = validated.data;
    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.slug !== undefined) updatePayload.slug = data.slug.toLowerCase().trim();
    if (data.tagline !== undefined) updatePayload.tagline = data.tagline?.trim() || null;
    if (data.bio !== undefined) updatePayload.bio = data.bio?.trim() || null;
    if (data.location !== undefined) updatePayload.location = data.location?.trim() || null;
    if (data.currency !== undefined) updatePayload.currency = data.currency;
    if (data.instagram !== undefined) updatePayload.instagram = data.instagram?.trim() || null;
    if (data.whatsapp !== undefined) updatePayload.whatsapp = data.whatsapp?.trim() || null;
    if (data.phone !== undefined) updatePayload.phone = data.phone?.trim() || null;
    if (data.website !== undefined) updatePayload.website = data.website?.trim() || null;
    if (data.heroShowreelUrl !== undefined) updatePayload.heroShowreelUrl = data.heroShowreelUrl?.trim() || null;
    if (data.heroPosterUrl !== undefined) updatePayload.heroPosterUrl = data.heroPosterUrl?.trim() || null;
    if (data.logo !== undefined) updatePayload.logo = data.logo || null;

    const [updated] = await db
      .update(organizations)
      .set(updatePayload)
      .where(eq(organizations.id, authCtx.orgId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/organization error:", error);
    return NextResponse.json({ error: "Failed to update studio profile" }, { status: 500 });
  }
}
