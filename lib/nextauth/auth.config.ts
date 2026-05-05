/**
 * auth.config.ts — Edge-compatible NextAuth configuration.
 *
 * This file is imported by BOTH:
 *   1. auth.ts     (Node.js — full server)
 *   2. proxy.ts    (Edge Runtime — Next.js proxy/middleware)
 *
 * ⚠️  Keep this file free of Node.js-only imports (e.g. bcrypt, fs, crypto from node).
 *     Only Web APIs are allowed (crypto.randomUUID, fetch, btoa, etc.).
 */

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ROLE_CODE } from "@/lib/constants/roles";
import { LoginApiResponse, JwtPayload } from "../types/auth";

// ─── Dummy user seed ───────────────────────────────────────────────────────────
// Remove when real backend is live. See authorizeWithApi() below.

interface DummyUserSeed {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role_code: string;
  role_name: string;
  is_active: boolean;
  unit_name?: string;
}

const DUMMY_USERS: DummyUserSeed[] = [
  {
    username: "staf.santoso",
    password: "password",
    email: "staf@xyz.id",
    full_name: "Budi Santoso",
    role_code: ROLE_CODE.STAF_UNIT,
    role_name: "Staf Unit",
    is_active: true,
    unit_name: "XYZ Cabang Sudirman",
  },
  {
    username: "siti.rahayu",
    password: "password",
    email: "dapur@xyz.id",
    full_name: "Siti Rahayu",
    role_code: ROLE_CODE.TIM_DAPUR,
    role_name: "Tim Dapur",
    is_active: true,
    unit_name: "XYZ Cabang Sudirman",
  },
  {
    username: "andi.wijaya",
    password: "password",
    email: "manajer@xyz.id",
    full_name: "Andi Wijaya",
    role_code: ROLE_CODE.MANAJER_UNIT,
    role_name: "Manajer Unit",
    is_active: true,
    unit_name: "XYZ Cabang Sudirman",
  },
  {
    username: "dewi.kusuma",
    password: "password",
    email: "grup@xyz.id",
    full_name: "Dewi Kusuma",
    role_code: ROLE_CODE.MANAJEMEN_GRUP,
    role_name: "Manajemen Grup",
    is_active: true,
    // No unit — group management is cross-unit
  },
];

// ─── Dummy authorize ───────────────────────────────────────────────────────────

function authorizeDummy(credentials: Partial<Record<string, unknown>>) {
  const username = credentials.username as string | undefined;
  const password = credentials.password as string | undefined;

  if (!username || !password) return null;

  const match = DUMMY_USERS.find(
    (u) => u.username === username && u.password === password,
  );

  if (!match) return null;

  // All dummy users are active — is_active check mirrors what authorizeWithApi does
  if (!match.is_active) return null;

  const userId = crypto.randomUUID();
  const unitId = match.unit_name ? crypto.randomUUID() : null;

  return {
    // NextAuth standard fields
    id: userId,
    name: null,
    email: null,
    image: null,

    // Minimal JWT fields — full profile comes from /auth/me
    user_id: userId,
    role_code: match.role_code,
    unit_id: unitId,

    // Fake access token for dummy mode (backend will return a real JWT)
    access_token: `dummy-token-${userId}`,
  };
}

// ─── Real API authorize ────────────────────────────────────────────────────────
// Uncomment NEXT_PUBLIC_AUTH_MODE=real in .env.local when backend is ready.
// Backend must return the shape defined in LoginApiResponse (lib/types/auth.ts).

async function authorizeWithApi(credentials: Partial<Record<string, unknown>>) {
  const username = credentials.username as string | undefined;
  const password = credentials.password as string | undefined;

  if (!username || !password) return null;

  try {
    const res = await fetch(`${process.env.API_BASE_URL ?? ""}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) return null;

    const data: LoginApiResponse = await res.json();
    if (!data.accessToken) return null;

    // Decode JWT payload (edge-safe — no library needed)
    const rawPayload = data.accessToken.split(".")[1];
    const payload = JSON.parse(
      atob(rawPayload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as JwtPayload;

    return {
      // NextAuth standard fields
      id: payload.sub,
      // name: null,
      // email: null,
      // image: null,

      // Minimal fields stored in JWT — full profile is fetched via /auth/me
      user_id: payload.sub,
      role_code: payload.roles,
      // units[] in JWT contains unit_names; we only keep the first unit_name as unit_id placeholder
      // until /auth/me returns the proper business_unit_id
      unit_id: payload.units?.[0] ?? null,

      // Backend JWT for API calls
      access_token: data.accessToken,
    };
  } catch {
    return null;
  }
}

// ─── JWT claims type ──────────────────────────────────────────────────────────
// Minimal fields stored in the NextAuth JWT token.
// Full profile is fetched on-demand via GET /auth/me (useMe hook).
// Kept here (not in auth.ts) so the edge middleware (proxy.ts) can also use it.

interface AuthJWT {
  user_id: string;
  role_code: string;
  unit_id: string | null;
  access_token: string;
}

// ─── NextAuth config ──────────────────────────────────────────────────────────

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeWithApi(credentials);
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login", // redirect auth errors back to login page
  },

  session: { strategy: "jwt" },

  callbacks: {
    /**
     * jwt — runs on every JWT creation / refresh.
     * On sign-in, copies custom fields from authorize() result → JWT payload.
     * On subsequent requests only `token` is provided (user is undefined).
     *
     * Lives here (not only in auth.ts) so the edge proxy can also apply it.
     */
    jwt({ token, user }) {
      if (user) {
        const t = token as typeof token & AuthJWT;
        const u = user as typeof user & AuthJWT;
        t.user_id = u.user_id;
        t.role_code = u.role_code;
        t.unit_id = u.unit_id;
        t.access_token = u.access_token;

        // Sync NextAuth session expiry with the backend JWT's exp claim,
        // so the session cookie expires at the same time as the access_token.
        try {
          const parts = u.access_token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(
              atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
            ) as { exp?: number };
            if (payload.exp) {
              token.exp = payload.exp; // seconds since epoch
            }
          }
        } catch {
          // Ignore decode failure — token will use default NextAuth maxAge
        }
      }
      return token;
    },

    /**
     * session — maps minimal JWT claims → session.user.
     * Full profile is available via GET /auth/me (useMe hook).
     */
    session({ session, token }) {
      const t = token as typeof token & AuthJWT;
      session.user.user_id = t.user_id;
      session.user.role_code = t.role_code;
      session.user.unit_id = t.unit_id;
      session.user.access_token = t.access_token;
      return session;
    },
  },
} satisfies NextAuthConfig;
