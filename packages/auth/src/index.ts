import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { db } from "@crea8or/db/client";
import * as schema from "@crea8or/db/schema";

export const auth = betterAuth({
  // The URL where this app runs — Next.js handles /api/auth/* routes
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",

  // Secret used to sign session tokens — must match across all restarts
  secret: process.env.BETTER_AUTH_SECRET || "crea8or_secure_auth_secret_dev_2026_minimum_32chars",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.organizations,
      member: schema.members,
      invitation: schema.invitations,
      twoFactor: schema.twoFactors,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true, // Automatically sign in after registration
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
    }),
    twoFactor({
      issuer: "Crea8or OS",
    }),
  ],

  trustedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
