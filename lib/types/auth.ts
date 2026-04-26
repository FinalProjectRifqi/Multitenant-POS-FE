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
  email: string;
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
