import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/two-factor",
  "/onboarding",
];

// Route prefixes that are always public (client portals & API routes)
const PUBLIC_PREFIXES = [
  "/api/",     // All API routes handle their own auth checks
  "/b/",       // Public booking pages
  "/p/",       // Public portfolio pages
  "/g/",       // Public gallery pages
  "/review/",  // Public video review pages
  "/i/",       // Public invoice pages
  "/c/",       // Public call sheet pages
  "/q/",       // Public quote & proposal pages
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // Better Auth session cookies:
  // On localhost (HTTP): better-auth.session_token
  // On production (HTTPS): __Secure-better-auth.session_token
  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better_auth.session_token")?.value ||
    request.cookies.get("better_auth.session_token")?.value ||
    request.cookies.get("crea8or_session")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
