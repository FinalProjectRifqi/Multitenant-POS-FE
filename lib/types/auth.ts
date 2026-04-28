// ─── Domain Models (mirrors ERD tables) ──────────────────────────────────────

export interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  unit_id: string;
  unit_name: string;
  unit_address: string;
  phone_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  permission_id: string;
  feature: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  role_id: string;
  full_name: string;
  username: string;
  email: string;
  last_login_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  /** Joined from roles table */
  role?: Role;
  /** Joined from units table (nullable — Manajemen Grup has no unit) */
  unit?: Unit | null;
}

// ─── Auth Request / Response ──────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  /** Seconds until token expires */
  expires_in: number;
}

export interface LoginResponse {
  token: AuthToken;
  user: User;
}

// ─── Backend API response contract ────────────────────────────────────────────
//
// This interface defines the exact shape the backend /auth/login endpoint must
// return. Frontend (authorizeWithApi) maps this to the NextAuth User object.
//
// Backend developers: align your response to this contract.

export interface LoginApiResponse {
  token: {
    /** JWT access token — send as `Authorization: Bearer <access_token>` */
    access_token: string;
    token_type: "Bearer";
    /** Seconds until access_token expires (e.g. 3600 = 1 hour) */
    expires_in: number;
  };
  user: {
    /** From users table */
    user_id: string;
    role_id: string;
    full_name: string;
    username: string;
    email: string;
    is_active: boolean;
    /** Joined from roles table */
    role: {
      role_id: string;
      role_code: string;
      role_name: string;
      description: string;
      is_active: boolean;
    };
    /**
     * Joined from units table via user_units (single active unit).
     * null for Manajemen Grup (cross-unit role).
     */
    unit: {
      unit_id: string;
      unit_name: string;
    } | null;
  };
}
