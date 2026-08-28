import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Always use the same origin as the browser — no cross-origin issues
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),

  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useActiveOrganization,
  twoFactor,
  organization,
} = authClient;
