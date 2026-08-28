import type { Context, Next } from "hono";
import { auth } from "@crea8or/auth";
import { db } from "@crea8or/db/client";
import { organizations, members } from "@crea8or/db/schema";
import { eq, and } from "drizzle-orm";
import type { AppEnv } from "../types.js";

/**
 * Middleware: requireAuth
 * Validates the session via Better Auth, injects user, session, organization, and member role into context.
 */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session?.user) {
      return c.json({ error: "Unauthorized — Please log in to continue" }, 401);
    }

    const orgId =
      (session.session as any)?.activeOrganizationId ||
      (session.user as any)?.organizationId;

    let org: any = null;
    let memberRole = "member";

    if (orgId) {
      const [foundOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, orgId));
      org = foundOrg || null;

      const [member] = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.organizationId, orgId),
            eq(members.userId, session.user.id as string)
          )
        );

      if (member) {
        memberRole = member.role;
      }
    }

    c.set("user", session.user);
    c.set("session", session.session);
    c.set("organization", org);
    c.set("role", memberRole);

    await next();
  } catch (err) {
    console.error("Auth middleware validation error:", err);
    return c.json({ error: "Authentication verification failed" }, 401);
  }
}

/**
 * Middleware: requireRole
 * Restricts access to specific organization roles (e.g. ['owner', 'admin'])
 */
export function requireRole(allowedRoles: string[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const userRole = c.get("role") || "member";
    if (!allowedRoles.includes(userRole)) {
      return c.json(
        { error: "Forbidden — You do not have permission to perform this action" },
        403
      );
    }
    await next();
  };
}
