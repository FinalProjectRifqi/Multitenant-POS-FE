import { z } from "zod";

// ─── Request schema (drives client-side form validation) ──────────────────────

export const loginRequestSchema = z.object({
  username: z
    .string()
    .min(1, "Username wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

export type LoginFormValues = z.infer<typeof loginRequestSchema>;

// ─── Response schemas (validates API payloads when backend is ready) ──────────

const roleSchema = z.object({
  role_id: z.string(),
  role_name: z.string(),
  role_code: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const unitSchema = z.object({
  unit_id: z.string(),
  unit_name: z.string(),
  unit_address: z.string(),
  phone_number: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const userSchema = z.object({
  user_id: z.string(),
  role_id: z.string(),
  full_name: z.string(),
  username: z.string(),
  email: z.string().email(),
  last_login_at: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  role: roleSchema.optional(),
  unit: unitSchema.nullable().optional(),
});

const authTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export const loginResponseSchema = z.object({
  token: authTokenSchema,
  user: userSchema,
});
