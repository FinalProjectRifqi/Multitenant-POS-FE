"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { CrudDeleteInput, CrudUpdateInput } from "@/lib/api/crud-types";

import {
  CreateUserRequest,
  DeleteUserRequest,
  deleteUserRequestSchema,
  UpdateUserRequest,
  updateUserRequestSchema,
  updateUserResponseSchema,
  UserEntity,
  userIdSchema,
  userWritePayloadSchema,
} from "@/lib/types/user";
import {
  createUserResponseSchema,
  UsersListResponse,
  usersListResponseSchema,
} from "../schemas/user";
import { parseApiError } from "./parsed-api-error";

const USERS_ENDPOINT = "/users";
export type DeleteUserInput = CrudDeleteInput<"user_id">;
export type UpdateUserInput = CrudUpdateInput<UpdateUserRequest, "user_id">;
export type UserMutationResult<TData = void> =
  | { ok: true; data: TData }
  | { ok: false; status: number; message: string };

function assertValidUserId(id: string): string {
  return userIdSchema.parse(id);
}

function normalizeWritePayload(payload: CreateUserRequest): CreateUserRequest {
  const parsed = userWritePayloadSchema.parse(payload);

  return {
    user_name: parsed.user_name.trim(),
    email: parsed.email.trim(),
    full_name: parsed.full_name.trim(),
    password: parsed.password, // don't trim password — let users add spaces if they want
    role_id: parsed.role_id,
    business_unit_id: parsed.business_unit_id,
    // is_active: parsed.is_active as boolean, // coercion already done by schema
  };
}

// ── API calls ─────────────────────────────────────────────────────────────────

// async function getUnitsWithApi(): Promise<User[]> {
//   return apiGet<User[]>(USERS_ENDPOINT, {
//     schema: unitsListResponseSchema,
//   });
// }

async function createUserWithApi(
  payload: CreateUserRequest,
): Promise<UserEntity> {
  const normalized = normalizeWritePayload(payload);

  return apiPost<UserEntity, CreateUserRequest>(USERS_ENDPOINT, normalized, {
    schema: createUserResponseSchema,
  });
}

async function updateUserWithApi(input: UpdateUserInput): Promise<UserEntity> {
  const userId = assertValidUserId(input.user_id);

  // Parse + coerce the payload (handles is_active string from form)
  const normalized = updateUserRequestSchema.parse(input.payload);

  return apiPatch<UserEntity, UpdateUserRequest>(
    `${USERS_ENDPOINT}/${userId}`,
    normalized as UpdateUserRequest,
    { schema: updateUserResponseSchema },
  );
}

async function deleteUserWithApi(input: DeleteUserInput): Promise<void> {
  // Validate the id — deleteUserRequestSchema checks it's a valid UUID
  const payload: DeleteUserRequest = deleteUserRequestSchema.parse(input);

  await apiDelete<void>(`${USERS_ENDPOINT}/${payload.user_id}`);
}

function toUserMutationError(error: unknown): UserMutationResult<never> {
  const parsed = parseApiError(error);

  return {
    ok: false,
    status: parsed.status,
    message: parsed.message,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getUsers(params?: {
  page?: number;
  limit?: number;
  sortBy?:
    | "full_name"
    | "username"
    | "business_unit_name"
    | "role_name"
    | "status"
    | "last_login";
  sortType?: "ASC" | "DESC";
  search?: string;
  role_id?: string;
  business_unit_id?: string;
}) {
  return apiGet<UsersListResponse>(USERS_ENDPOINT, {
    schema: usersListResponseSchema,
    params,
  });
}

export async function createUser(
  payload: CreateUserRequest,
): Promise<UserMutationResult<UserEntity>> {
  try {
    const result = await createUserWithApi(payload);
    return { ok: true, data: result };
  } catch (error) {
    return toUserMutationError(error);
  }
}

export async function updateUser(
  input: UpdateUserInput,
): Promise<UserMutationResult<UserEntity>> {
  try {
    const result = await updateUserWithApi(input);
    return { ok: true, data: result };
  } catch (error) {
    return toUserMutationError(error);
  }
}

export async function deleteUser(
  input: DeleteUserInput,
): Promise<UserMutationResult<void>> {
  try {
    await deleteUserWithApi(input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toUserMutationError(error);
  }
}
