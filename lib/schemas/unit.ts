// ─────────────────────────────────────────────
// lib/schemas/unit/schemas.ts
// Zod schemas — all runtime validation lives here
// ─────────────────────────────────────────────

import { z } from "zod";

// ── Primitives ────────────────────────────────────────────────────────────────

export const unitIdSchema = z.string().uuid("ID unit tidak valid");

export const unitStatusSchema = z.enum(["active", "inactive"]);

/**
 * Coerces form values to boolean.
 * A <select> always yields a string; this handles both the string
 * ("true"/"false") and a real boolean coming from state/defaults.
 */
const isActiveSchema = z.union([
  z.boolean(),
  z.enum(["true", "false"]).transform((v) => v === "true"),
]);

// ── Write payload (CREATE + UPDATE request body) ───────────────────────────────

export const unitWritePayloadSchema = z.object({
  business_unit_name: z
    .string()
    .trim()
    .min(3, "Nama unit minimal 3 karakter")
    .max(120, "Nama unit maksimal 120 karakter"),
  business_unit_address: z
    .string()
    .trim()
    .min(5, "Alamat minimal 5 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  business_unit_phone: z
    .string()
    .trim()
    .min(10, "Nomor telepon minimal 10 karakter")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(/^[0-9+\-()\s]+$/, "Format nomor telepon tidak valid"),
  is_active: isActiveSchema,
});

export const createUnitRequestSchema = unitWritePayloadSchema;
export const updateUnitRequestSchema = unitWritePayloadSchema;

export const deleteUnitRequestSchema = z.object({
  business_unit_id: unitIdSchema,
});

// ── API response entity (what the server returns) ─────────────────────────────

/**
 * Parses a single unit from the API.
 * "active"/"inactive" → boolean so the UI never has to deal with raw strings.
 */
export const unitSchema = z.object({
  business_unit_id: unitIdSchema,
  business_unit_name: z.string(),
  business_unit_address: z.string(),
  business_unit_phone: z.string(),
  // Transform string status → boolean
  business_unit_status: unitStatusSchema.transform((v) => v === "active"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// ── List response ─────────────────────────────────────────────────────────────

/**
 * Handles both shapes the API might return:
 *  - Bare array:          UnitEntity[]
 *  - Envelope:            { data: UnitEntity[], meta?: {...} }
 */
export const unitsListResponseSchema = z
  .object({
    data: z.array(unitSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
  .transform((payload) => ({
    data: payload.data, // UnitEntity[]
    meta: payload.meta, // PaginationMeta
  }));

export type UnitsListResponse = z.infer<typeof unitsListResponseSchema>;
export type PaginationMeta = UnitsListResponse["meta"];

// ── Single-entity response (CREATE / UPDATE) ──────────────────────────────────

/**
 * Handles both shapes:
 *  - Bare object:   UnitEntity
 *  - Envelope:      { data: UnitEntity }
 */
export const unitEntityResponseSchema = z.union([
  unitSchema,
  z.object({ data: unitSchema }).transform((payload) => payload.data),
]);

export const createUnitResponseSchema = unitEntityResponseSchema;
export const updateUnitResponseSchema = unitEntityResponseSchema;
