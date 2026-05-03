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
import { JwtPayload, LoginApiResponse } from "../types/auth";

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
  const roleId = crypto.randomUUID();
  const unitId = match.unit_name ? crypto.randomUUID() : null;

  return {
    // NextAuth standard fields
    id: userId,
    name: match.full_name,
    email: match.email,
    image: null,

    // From users table
    user_id: userId,
    full_name: match.full_name,
    username: match.username,
    is_active: match.is_active,

    // From roles table (joined)
    role_id: roleId,
    role_code: match.role_code,
    role_name: match.role_name,

    // From units table via user_units (single active unit)
    unit_id: unitId,
    unit_name: match.unit_name ?? null,

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
      id: payload.sub, // ✅ required
      name: payload.full_name,
      email: payload.email,
      image: null,

      // From users table
      user_id: payload.sub,
      full_name: payload.full_name,
      username: username, // not in JWT, use login credential
      is_active: true, // backend already validated this

      // From roles
      role_id: "", // not in JWT
      role_code: payload.roles, // e.g. "GROUP_MANAGEMENT"
      role_name: payload.roles,
      // TODO: Uncomment code below if backend returns the role object in the JWT
      // role_id: payload.roles.role_id,                   // not in JWT
      // role_code: payload.roles.role_code,
      // role_name: payload.roles.role_name,

      // From units (empty array = cross-unit role)
      unit_id: payload.units?.[0] ?? null,
      unit_name: null, // not in JWT
      // TODO: Uncomment code below if backend returns the unit object in the JWT
      // unit_id: payload.units?.[0]?.unit_id ?? null,
      // unit_name: payload.units?.[0]?.unit_name ?? null,               // not in JWT

      // Backend JWT for API calls
      access_token: data.accessToken,
    };
  } catch {
    return null;
  }
}

// ─── JWT claims type ──────────────────────────────────────────────────────────
// Mirrors the custom fields written to the JWT token in the jwt callback.
// Kept here (not in auth.ts) so the edge middleware (proxy.ts) can also use it.

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
        t.username = u.username;
        t.full_name = u.full_name;
        t.is_active = u.is_active;
        t.role_id = u.role_id;
        t.role_code = u.role_code;
        t.role_name = u.role_name;
        t.unit_id = u.unit_id;
        t.unit_name = u.unit_name;
        t.access_token = u.access_token;
      }
      return token;
    },

    /**
     * session — maps JWT claims → session.user so client and edge middleware
     * can read role_code, access_token, etc. from request.auth / useSession().
     *
     * Lives here so both the edge proxy and the full Node.js auth instance
     * expose the same session shape.
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
} satisfies NextAuthConfig;
