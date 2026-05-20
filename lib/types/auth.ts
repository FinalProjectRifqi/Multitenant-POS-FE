// ─── getUserById API response contract ────────────────────────────────────────

export interface GetUserByIdApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user_id: string;
    full_name: string;
    user_name: string;
    email: string;
    role_id: string | null;
    role_name: string | null;
    role_code: string | null;
    status: "active" | "inactive";
    last_login: string | null;
    business_units: Array<{
      business_unit_id: string;
      business_unit_name: string;
    }>;
  };
}

// ─── /auth/me API response contract ───────────────────────────────────────────

export interface CurrentUserApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user_id: string;
    full_name: string;
    user_name: string;
    email: string;
    role_id: string | null;
    role_name: string | null;
    role_code: string;
    status: "active" | "inactive";
    last_login: string | null;
    business_units: Array<{
      business_unit_id: string;
      business_unit_name: string;
    }>;
    permissions: string[];
    must_change_password: boolean;
  };
}

/** Normalised /auth/me data shape used in app UI */
export interface CurrentUserData {
  user_id: string;
  full_name: string;
  user_name: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  role_code: string;
  status: "active" | "inactive";
  last_login: string | null;
  business_units: Array<{
    business_unit_id: string;
    business_unit_name: string;
  }>;
  permissions: string[];
  must_change_password: boolean;
}

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
  success: boolean;
  status: number;
  message: string;
  accessToken: string; // JWT string — must be decoded to get user info
}

// Shape of the decoded JWT payload
export interface JwtPayload {
  sub: string; // user_id
  typ: string;
  roles: string; // e.g. "GROUP_MANAGEMENT"
  permission: string[];
  full_name: string;
  email: string;
  units: string[]; // empty array for cross-unit roles
  unit_name: string;
  must_change_password: boolean;
  iat: number;
  exp: number;
}
