/**
 * auth.ts — Full NextAuth instance (Node.js runtime only).
 *
 * Exports:
 *   - handlers  → used by app/api/auth/[...nextauth]/route.ts
 *   - auth      → used in Server Components / API Routes to read session
 *   - signIn    → used server-side (Server Actions) — prefer signIn from next-auth/react on client
 *   - signOut   → used server-side — prefer signOut from next-auth/react on client
 *
 * Type augmentation for NextAuth is declared here so it applies project-wide.
 *
 * ⚠️  DO NOT import this file in proxy.ts / middleware.
 *     proxy.ts creates its own NextAuth instance from auth.config.ts (edge-safe).
 */

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface User {
    /** From users table */
    user_id: string;
    /** From roles (JWT `roles` claim) */
    role_code: string;
    /** First unit from JWT units[] (nullable — group management has no unit) */
    unit_id: string | null;
    /** Backend access token — used for Authorization: Bearer on API calls */
    access_token: string;
  }

  interface Session {
    user: {
      /** NextAuth standard fields */
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** Minimal fields — full profile is fetched via GET /auth/me (useMe hook) */
      user_id: string;
      role_code: string;
      unit_id: string | null;
      /** Backend access token for client-side API calls */
      access_token: string;
    };
  }
}

// ─── NextAuth instance ────────────────────────────────────────────────────────
// Callbacks (jwt + session) are defined in authConfig so they also run in the
// edge proxy (proxy.ts). auth.ts spreads authConfig and adds trustHost only.

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  /**
   * trustHost must be true when running behind a reverse proxy or in
   * non-standard environments (Docker, ngrok, etc.).
   */
  trustHost: true,
});
