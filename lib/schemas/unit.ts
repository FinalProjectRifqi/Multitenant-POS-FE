import { z } from "zod";

export const unitStatusSchema = z.enum(["active", "inactive"]);

export type UnitStatus = z.infer<typeof unitStatusSchema>;

export const unitIdSchema = z.string().uuid("ID unit tidak valid");

const statusFromApiSchema = z
  .string()
  .transform((value) => value.toLowerCase())
  .pipe(unitStatusSchema);

const unitWritePayloadSchema = z.object({
  unit_name: z
    .string()
    .trim()
    .min(3, "Nama unit minimal 3 karakter")
    .max(120, "Nama unit maksimal 120 karakter"),
  unit_address: z
    .string()
    .trim()
    .min(5, "Alamat minimal 5 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  phone_number: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 karakter")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(/^[0-9+\-()\s]+$/, "Format nomor telepon tidak valid"),
  status: unitStatusSchema,
});

export const createUnitRequestSchema = unitWritePayloadSchema;

export type CreateUnitRequest = z.infer<typeof createUnitRequestSchema>;

export const updateUnitRequestSchema = unitWritePayloadSchema;

export type UpdateUnitRequest = z.infer<typeof updateUnitRequestSchema>;

export const deleteUnitRequestSchema = z.object({
  unit_id: unitIdSchema,
});

export type DeleteUnitRequest = z.infer<typeof deleteUnitRequestSchema>;

export const unitSchema = z.object({
  unit_id: unitIdSchema,
  unit_name: z.string(),
  unit_address: z.string(),
  phone_number: z.string(),
  status: statusFromApiSchema,
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export type UnitEntity = z.infer<typeof unitSchema>;

export const unitsListResponseSchema = z.union([
  z.array(unitSchema),
  z.object({ data: z.array(unitSchema) }).transform((payload) => payload.data),
]);

export const createUnitResponseSchema = z.union([
  unitSchema,
  z.object({ data: unitSchema }).transform((payload) => payload.data),
]);

export const updateUnitResponseSchema = createUnitResponseSchema;
