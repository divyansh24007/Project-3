import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Dashboard protection
  if (pathname.startsWith("/dashboard")) {
    // Check for Supabase session cookies
    const allCookies = request.cookies.getAll();
    const hasSupabaseCookie = allCookies.some(
      (cookie) =>
        cookie.name.includes("sb-") &&
        (cookie.name.includes("-auth-token") || cookie.name.includes("-access-token"))
    );

    // In local development or demo environment, allow pass-through if mock session is used
    const isDev = process.env.NODE_ENV !== "production";
    const demoBypassCookie = request.cookies.get("aegis_demo_session");

    if (!hasSupabaseCookie && !demoBypassCookie && !isDev) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
