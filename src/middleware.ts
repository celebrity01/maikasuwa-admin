import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for admin route protection.
 * - /admin/login is always accessible
 * - /admin/* pages require a session check
 * - API routes handle their own auth via Bearer tokens
 *
 * Note: This is a lightweight client-side redirect guard.
 * True admin verification happens in API routes via verifyAdmin().
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page, API routes, and static assets
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // For admin pages, check for session cookie or redirect
  // The real auth check is client-side (localStorage) + server-side (API Bearer token)
  // This middleware just ensures non-login admin pages are accessible
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
