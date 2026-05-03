/**
 * proxy.ts — Edge-compatible auth + role-based route guard.
 *
 * Uses a dedicated NextAuth instance built from auth.config.ts (edge-safe).
 * DO NOT import from @/auth here — that file is Node.js only.
 *
 * Guard rules:
 *   - Root path /            → if unauthenticated → /login;
 *                              if authenticated + unknown role → force-logout + /login;
 *                              if authenticated + known role → role dashboard (direct)
 *   - Unauthenticated user   → /login (with callbackUrl)
 *   - Authenticated + /login → role-appropriate dashboard
 *   - GROUP_MANAGEMENT role  → may only access /group, NOT /unit
 *   - All other roles        → may only access /unit,  NOT /group
 *   - Wrong-role access      → /403
 */

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./lib/nextauth/auth.config";
import { ROLE_CODE, getDashboardRoute } from "./lib/constants/roles";
import type { JwtPayload } from "./lib/types/auth";

// Edge-safe NextAuth instance. trustHost is enabled to support
// localhost/IP access in local and reverse-proxy environments.
const { auth } = NextAuth({
  ...authConfig,
  trustHost: true,
});

// ─── Token Expiration Validation ────────────────────────────────────────────────
/**
 * Decodes JWT payload safely (edge-compatible, no library needed).
 * Returns null if decode fails.
 */
function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Standard Base64 URL decode (edge-compatible)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Checks if JWT token is expired.
 * JWT exp claim is in seconds (Unix timestamp).
 * Returns true if expired, false if valid.
 */
function isTokenExpired(accessToken: string | undefined): boolean {
  if (!accessToken) return true;

  const payload = decodeJwt(accessToken);
  if (!payload?.exp) return true;

  // Current time in seconds
  const nowInSeconds = Math.floor(Date.now() / 1000);
  // Add 10-second buffer to avoid edge case where token expires mid-request
  const bufferInSeconds = 10;

  return payload.exp < nowInSeconds + bufferInSeconds;
}

const GROUP_PREFIX = "/group";
const UNIT_PREFIX = "/unit";
const PROTECTED_PREFIXES = [GROUP_PREFIX, UNIT_PREFIX];
const LOGIN_PATH = "/login";
const FORBIDDEN_PATH = "/403";

/** All valid role_code values — used to detect corrupt/unknown JWT payloads. */
const KNOWN_ROLES: ReadonlySet<string> = new Set(Object.values(ROLE_CODE));

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const isAuthenticated = Boolean(session?.user);
  const roleCode = (session?.user as { role_code?: string } | undefined)
    ?.role_code;
  const accessToken = (session?.user as { access_token?: string } | undefined)
    ?.access_token;

  // Check if token is expired (even if session exists)
  const isTokenValid = !isTokenExpired(accessToken);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // ── 0. Token Expiration Check (BEFORE any routing logic) ────────────────────
  // If user has session but token is expired, treat as unauthenticated
  // and redirect to /login (don't crash with SSR error).
  if (isAuthenticated && !isTokenValid && isProtected) {
    const loginUrl = new URL(LOGIN_PATH, request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 1. Root path / → smart role-aware redirect ─────────────────────────────
  if (pathname === "/") {
    if (!isAuthenticated || !isTokenValid) {
      // No active session or token expired → send to /login (no callbackUrl; root is not a resource)
      return NextResponse.redirect(new URL(LOGIN_PATH, request.nextUrl.origin));
    }
    if (!roleCode || !KNOWN_ROLES.has(roleCode)) {
      // Valid session but unrecognised role → force-logout: clear cookies + /login
      const response = NextResponse.redirect(
        new URL(LOGIN_PATH, request.nextUrl.origin),
      );
      // Clear both dev (HTTP) and prod (HTTPS) session cookie variants
      response.cookies.delete("authjs.session-token");
      response.cookies.delete("__Secure-authjs.session-token");
      return response;
    }
    // Known role → redirect directly to the role-appropriate dashboard
    return NextResponse.redirect(
      new URL(getDashboardRoute(roleCode), request.nextUrl.origin),
    );
  }

  // ── 2. Unauthenticated + protected route → /login ──────────────────────────
  if (isProtected && (!isAuthenticated || !isTokenValid)) {
    const loginUrl = new URL(LOGIN_PATH, request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Authenticated + /login → role-appropriate dashboard ─────────────────
  if (pathname === LOGIN_PATH && isAuthenticated && isTokenValid) {
    const dashboardPath = getDashboardRoute(roleCode ?? "");
    const dashboardUrl = new URL(dashboardPath, request.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  // ── 4. Role guard: only GROUP_MANAGEMENT may access /group ─────────────────
  if (
    pathname.startsWith(GROUP_PREFIX) &&
    isAuthenticated &&
    roleCode !== ROLE_CODE.MANAJEMEN_GRUP
  ) {
    const forbiddenUrl = new URL(FORBIDDEN_PATH, request.nextUrl.origin);
    return NextResponse.redirect(forbiddenUrl);
  }

  // ── 5. Role guard: GROUP_MANAGEMENT may NOT access /unit ───────────────────
  if (
    pathname.startsWith(UNIT_PREFIX) &&
    isAuthenticated &&
    roleCode === ROLE_CODE.MANAJEMEN_GRUP
  ) {
    const forbiddenUrl = new URL(FORBIDDEN_PATH, request.nextUrl.origin);
    return NextResponse.redirect(forbiddenUrl);
  }
});

export const config = {
  /*
   * Match all routes EXCEPT:
   * - Next.js internals  (_next/static, _next/image)
   * - Static files        (favicon.ico)
   * - NextAuth API routes (/api/auth/*) ← must NOT be protected to allow sign-in/out
   * - Other API routes    (/api/*)
   * - /403                ← must be accessible without role check
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|403).*)"],
};
