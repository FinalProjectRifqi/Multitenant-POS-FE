// lib/schemas/user.ts
import { z } from "zod";
import type { UserEntity } from "../types/user";

export const userIdSchema = z.string().uuid("ID user tidak valid");
export const userStatusSchema = z.enum(["active", "inactive"]);

export const userWritePayloadSchema = z.object({
  role_id: z.string().uuid("ID role tidak valid"),
  business_unit_id: z
    .string()
    .uuid("ID unit tidak valid")
    .nullable()
    .optional(),
  full_name: z
    .string()
    .trim()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  user_name: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter"),
  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .max(100, "Email maksimal 100 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter"),
});

export const createUserRequestSchema = userWritePayloadSchema;
export const updateUserRequestSchema = userWritePayloadSchema.omit({
  password: true,
});

export const deleteUserRequestSchema = z.object({
  user_id: userIdSchema,
});

export const userSchema = z.object({
  user_id: userIdSchema,
  full_name: z.string(),
  user_name: z.string().optional(),
  email: z.string().optional().catch(""),
  role_id: z.string(),
  role_name: z.string().optional().catch(""),
  status: z.union([
    z.boolean(),
    userStatusSchema.transform((s) => s === "active"),
  ]).optional().catch(true),
  last_login: z.string().nullable().optional().catch(null),
  business_units: z
    .array(
      z.object({
        business_unit_id: z.string(),
        business_unit_name: z.string(),
      }),
    )
    .nullable()
    .optional(),
}).transform((val) => ({
  ...val,
  user_name: val.user_name,
  email: val.email ?? "",
  role_id: val.role_id ?? "00000000-0000-0000-0000-000000000000",
  role_name: val.role_name ?? "",
  status: val.status ?? true,
  last_login: val.last_login ?? null
})) as unknown as z.ZodType<UserEntity>;

export const usersListResponseSchema = z.object({
  data: z.array(userSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
export type PaginationMeta = UsersListResponse["meta"];

export const userEntityResponseSchema = z.union([
  userSchema,
  z.object({ data: userSchema }).transform((payload) => payload.data),
  z
    .object({
      success: z.boolean().optional(),
      statusCode: z.number().optional(),
      message: z.string().optional(),
      data: userSchema,
    })
    .transform((payload) => payload.data),
]);

export const createUserResponseSchema = z.union([
  userEntityResponseSchema,
  z
    .object({
      success: z.boolean().optional(),
      statusCode: z.number().optional(),
      message: z.string().optional(),
      data: z.object({
        user_id: userIdSchema,
        user_name: z.string().optional(),
        password: z.string().optional(),
      }),
    })
    .transform((payload) => ({
      user_id: payload.data.user_id,
      full_name: "",
      user_name: payload.data.user_name ?? "",
      email: "",
      role_id: "",
      role_name: "",
      status: true,
      last_login: null,
      business_units: null,
    })),
]);
export const updateUserResponseSchema = userEntityResponseSchema;
