// ─────────────────────────────────────────────
// lib/schemas/user/index.ts
// Barrel — import from here everywhere else
// ─────────────────────────────────────────────

// Pure TypeScript types (no Zod)
export type {
  UserStatus,
  UserEntity,
  UserWritePayload,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  PaginationMeta,
} from "./user";

// Zod schemas (runtime validation)
export {
  userIdSchema,
  userStatusSchema,
  userWritePayloadSchema,
  createUserRequestSchema,
  updateUserRequestSchema,
  deleteUserRequestSchema,
  userSchema,
  usersListResponseSchema,
  userEntityResponseSchema,
  createUserResponseSchema,
  updateUserResponseSchema,
} from "@/lib/schemas/user";
