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

// ─── Module augmentation — adds custom fields to NextAuth session/JWT ─────────

declare module "next-auth" {
  interface User {
    /** From users table */
    user_id: string;
    username: string;
    full_name: string;
    is_active: boolean;
    /** From roles table (joined) */
    role_id: string;
    role_code: string;
    role_name: string;
    /** From units table via user_units (single active unit, nullable) */
    unit_id: string | null;
    unit_name: string | null;
    /** Backend access token — used for Authorization: Bearer on API calls */
    access_token: string;
  }

  interface Session {
    user: {
      /** NextAuth standard fields */
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** From users table */
      user_id: string;
      username: string;
      full_name: string;
      /** From roles table */
      role_id: string;
      role_code: string;
      role_name: string;
      /** From units table (nullable) */
      unit_id: string | null;
      unit_name: string | null;
      /** Backend access token for client-side API calls */
      access_token: string;
    };
  }
}

// ─── Local JWT claims type (mirrors the JWT augmentation above) ───────────────
// Used for type-safe token access inside callbacks when module augmentation
// cannot be resolved (e.g. pnpm deep hoisting of @auth/core).

interface AuthJWT {
  user_id: string;
  username: string;
  full_name: string;
  is_active: boolean;
  role_id: string;
  role_code: string;
  role_name: string;
  unit_id: string | null;
  unit_name: string | null;
  access_token: string;
}

// ─── NextAuth instance ────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  callbacks: {
    /**
     * jwt — called every time a JWT is created or updated.
     * On initial sign-in, `user` is the object returned by `authorize()`.
     * On subsequent requests, only `token` is available.
     */
    jwt({ token, user }) {
      if (user) {
        // Copy custom fields from authorize() result → JWT payload.
        // Cast to AuthJWT to avoid TS errors caused by pnpm not hoisting @auth/core.
        const t = token as typeof token & AuthJWT;
        t.user_id = user.user_id;
        t.username = user.username;
        t.full_name = user.full_name;
        t.is_active = user.is_active;
        t.role_id = user.role_id;
        t.role_code = user.role_code;
        t.role_name = user.role_name;
        t.unit_id = user.unit_id;
        t.unit_name = user.unit_name;
        t.access_token = user.access_token;
      }
      return token;
    },

    /**
     * session — called whenever a session is checked.
     * Exposes JWT claims to session.user so client code can read them.
     * NOTE: is_active is intentionally NOT exposed — it is validated at login only.
     */
    session({ session, token }) {
      const t = token as typeof token & AuthJWT;
      session.user.user_id = t.user_id;
      session.user.username = t.username;
      session.user.full_name = t.full_name;
      session.user.role_id = t.role_id;
      session.user.role_code = t.role_code;
      session.user.role_name = t.role_name;
      session.user.unit_id = t.unit_id;
      session.user.unit_name = t.unit_name;
      session.user.access_token = t.access_token;
      return session;
    },
  },

  /**
   * trustHost must be true when running behind a reverse proxy or in
   * non-standard environments (Docker, ngrok, etc.).
   */
  trustHost: true,
});
