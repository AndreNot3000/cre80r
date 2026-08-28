"use client";

import { useState, useEffect } from "react";
import { createAuthClient } from "better-auth/client";
import { organizationClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          window.location.href = "/two-factor";
        }
      },
    }),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  twoFactor,
  organization,
} = authClient;

// Global in-memory session cache
let cachedSession: any = null;
const sessionListeners = new Set<(session: any) => void>();

export function setCachedSession(session: any) {
  cachedSession = session;
  sessionListeners.forEach((fn) => fn(session));
}

/**
 * Universal, React 19 & Next.js 15 SSR-safe useSession hook.
 * Never throws "Cannot read properties of null (reading 'useRef')".
 */
export function useSession() {
  const [sessionData, setSessionData] = useState<any>(cachedSession);
  const [isPending, setIsPending] = useState(!cachedSession);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const listener = (newSession: any) => {
      if (isMounted) {
        setSessionData(newSession);
        setIsPending(false);
      }
    };
    sessionListeners.add(listener);

    // Fetch live session
    authClient
      .getSession()
      .then((res) => {
        if (isMounted) {
          const session = res?.data || null;
          cachedSession = session;
          setSessionData(session);
          setIsPending(false);
          sessionListeners.forEach((l) => l(session));
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsPending(false);
        }
      });

    return () => {
      isMounted = false;
      sessionListeners.delete(listener);
    };
  }, []);

  return {
    data: sessionData,
    isPending,
    error,
  };
}
