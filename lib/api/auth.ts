/**
 * Auth Service — Single integration point for authentication.
 *
 * ───────────────────────────────────────────────────────────────────
 * TO SWITCH FROM DUMMY → REAL API:
 *
 *   1. Set `NEXT_PUBLIC_AUTH_MODE=real` in .env.local
 *   2. That's it — loginWithApi() will call your backend.
 *      If the response shape changes, update `loginResponseSchema`.
 * ───────────────────────────────────────────────────────────────────
 */

import { apiPost } from "@/lib/api/client";
import { loginResponseSchema } from "@/lib/schemas/auth";
import { ROLE_CODE } from "@/lib/constants/roles";
import type { LoginRequest, LoginResponse } from "@/lib/types/auth";

// ─── Token / User storage (thin abstraction for easy swap to cookies) ─────────

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const tokenStorage = {
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStorage = {
  set(user: LoginResponse["user"]): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  get(): LoginResponse["user"] | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse["user"];
    } catch {
      return null;
    }
  },
};

// ─── Dummy data (remove when backend is live) ─────────────────────────────────

interface DummyUserSeed {
  email: string;
  password: string;
  role_code: string;
  role_name: string;
  full_name: string;
  username: string;
  unit_name?: string;
}

const DUMMY_USERS: DummyUserSeed[] = [
  {
    email: "staf@xyz.id",
    password: "password",
    role_code: ROLE_CODE.STAF_UNIT,
    role_name: "Staf Unit",
    full_name: "Budi Santoso",
    username: "budi.santoso",
    unit_name: "XYZ Cabang Sudirman",
  },
  {
    email: "dapur@xyz.id",
    password: "password",
    role_code: ROLE_CODE.TIM_DAPUR,
    role_name: "Tim Dapur",
    full_name: "Siti Rahayu",
    username: "siti.rahayu",
    unit_name: "XYZ Cabang Sudirman",
  },
  {
    email: "manajer@xyz.id",
    password: "password",
    role_code: ROLE_CODE.MANAJER_UNIT,
    role_name: "Manajer Unit",
    full_name: "Andi Wijaya",
    username: "andi.wijaya",
    unit_name: "XYZ Cabang Sudirman",
  },
  {
    email: "grup@xyz.id",
    password: "password",
    role_code: ROLE_CODE.MANAJEMEN_GRUP,
    role_name: "Manajemen Grup",
    full_name: "Dewi Kusuma",
    username: "dewi.kusuma",
    // No unit — group management is cross-unit
  },
];

function buildDummyResponse(seed: DummyUserSeed): LoginResponse {
  const roleId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    token: {
      access_token: `dummy.jwt.${btoa(seed.email)}.${Date.now()}`,
      token_type: "Bearer",
      expires_in: 3600,
    },
    user: {
      user_id: userId,
      role_id: roleId,
      full_name: seed.full_name,
      username: seed.username,
      email: seed.email,
      last_login_at: null,
      is_active: true,
      created_at: now,
      updated_at: now,
      role: {
        role_id: roleId,
        role_name: seed.role_name,
        role_code: seed.role_code,
        description: `${seed.role_name} role`,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      unit: seed.unit_name
        ? {
            unit_id: crypto.randomUUID(),
            unit_name: seed.unit_name,
            unit_address: "Jl. Sudirman No. 1, Jakarta",
            phone_number: "021-12345678",
            status: "active",
            created_at: now,
            updated_at: now,
          }
        : null,
    },
  };
}

function delay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Login implementations ────────────────────────────────────────────────────

async function loginWithDummy(credentials: LoginRequest): Promise<LoginResponse> {
  await delay();

  const match = DUMMY_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password,
  );

  if (!match) {
    throw new Error("Email atau password salah. Silakan coba lagi.");
  }

  return buildDummyResponse(match);
}

async function loginWithApi(credentials: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse, LoginRequest>("/auth/login", credentials, {
    schema: loginResponseSchema,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Login — set `NEXT_PUBLIC_AUTH_MODE=real` in .env.local for real API.
 * Otherwise defaults to dummy mode.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const isDummy = process.env.NEXT_PUBLIC_AUTH_MODE !== "real";
  const response = isDummy
    ? await loginWithDummy(credentials)
    : await loginWithApi(credentials);

  tokenStorage.set(response.token.access_token);
  userStorage.set(response.user);

  return response;
}

export async function logout(): Promise<void> {
  tokenStorage.clear();
}
