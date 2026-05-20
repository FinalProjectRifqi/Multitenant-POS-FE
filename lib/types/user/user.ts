// lib/types/user.ts
import { Role } from "../auth";

export type UserStatus = "active" | "inactive";

export interface BusinessUnit {
  business_unit_id: string;
  business_unit_name: string;
}

export interface UserEntity {
  user_id: string;
  full_name: string;
  user_name: string;
  email: string;
  role_id: string;
  role_name: string;
  status: boolean;
  last_login: string | null; // ← hapus | undefined
  business_units?: BusinessUnit[] | null;
  role?: Role;
}

export interface UserWritePayload {
  role_id: string;
  business_unit_id?: string | null;
  full_name: string;
  user_name: string;
  email: string;
  password: string;
}

export type CreateUserRequest = UserWritePayload;
export type UpdateUserRequest = Omit<UserWritePayload, "password"> & {
  password?: string;
};

export interface DeleteUserRequest {
  user_id: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
