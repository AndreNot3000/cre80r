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

// Route prefixes that are always public (client portals)
const PUBLIC_PREFIXES = [
  "/api/auth", // Better Auth API routes — must always be accessible
  "/b/",       // Public booking pages
  "/p/",       // Public portfolio pages
  "/g/",       // Public gallery pages
  "/review/",  // Public video review pages
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

  // Better Auth sets this httpOnly cookie on successful login/register
  // It is a real token — not a fake "active" string
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

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
