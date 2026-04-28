/**
 * proxy.ts — Edge-compatible auth guard for all protected routes.
 *
 * Uses a dedicated NextAuth instance built from auth.config.ts (edge-safe).
 * DO NOT import from @/auth here — that file is Node.js only.
 *
 * Required env vars:
 *   AUTH_SECRET  (or NEXTAUTH_SECRET) — used to verify JWT signatures
 */

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./lib/nextauth/auth.config";

// Edge-safe NextAuth instance — only needs authConfig (no Node.js modules)
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/group", "/unit"];
const LOGIN_PATH = "/login";
const DEFAULT_DASHBOARD = "/group";

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const isAuthenticated = Boolean(session?.user);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // 1. Accessing a protected route without a session → redirect to /login
  if (isProtected && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    // Preserve intended destination so login page can redirect back after success
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already authenticated and trying to access /login → redirect to dashboard
  if (pathname === LOGIN_PATH && isAuthenticated) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = DEFAULT_DASHBOARD;
    dashboardUrl.searchParams.delete("callbackUrl");
    return NextResponse.redirect(dashboardUrl);
  }
});

export const config = {
  /*
   * Match all routes EXCEPT:
   * - Next.js internals  (_next/static, _next/image)
   * - Static files        (favicon.ico)
   * - NextAuth API routes (/api/auth/*) ← must NOT be protected to allow sign-in/out
   * - Other API routes    (/api/*)
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
