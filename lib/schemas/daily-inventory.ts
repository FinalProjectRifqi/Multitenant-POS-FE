import { z } from "zod";

// Per-item plan schema
export const dailyInventoryPlanItemSchema = z.object({
  daily_inventory_plan_id: z.string().uuid(),
  unit_id: z.string().uuid().optional(),
  date: z.string(),
  inventory_item_id: z.string().uuid(),
  inventory_item_name: z.string().optional(),
  planned_usage_qty: z.number().nonnegative(),
  unit: z.string(),
  notes: z.string().nullable().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export const dailyInventoryPlanListSchema = z.array(
  dailyInventoryPlanItemSchema,
);
export const dailyInventoryPlanListResponseSchema = z.union([
  dailyInventoryPlanListSchema,
  z.object({ data: dailyInventoryPlanListSchema }).transform((p) => p.data),
]);
export const dailyInventoryPlanItemResponseSchema = z.union([
  dailyInventoryPlanItemSchema,
  z.object({ data: dailyInventoryPlanItemSchema }).transform((p) => p.data),
]);

// Per-item realization schema
export const dailyInventoryRealizationItemSchema = z.object({
  daily_inventory_realization_id: z.string().uuid(),
  unit_id: z.string().uuid().optional(),
  date: z.string(),
  inventory_item_id: z.string().uuid(),
  inventory_item_name: z.string().optional(),
  daily_inventory_plan_id: z.string().uuid(),
  planned_usage_qty: z.number().nonnegative(),
  actual_usage_qty: z.number().nonnegative(),
  waste_qty: z.number().nonnegative(),
  remaining_qty: z.number().nonnegative().nullable().optional(),
  variance_qty: z.number(),
  unit: z.string().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]),
  submitted_by: z.string().uuid().optional(),
  submitted_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export const dailyInventoryRealizationListSchema = z.array(
  dailyInventoryRealizationItemSchema,
);
export const dailyInventoryRealizationListResponseSchema = z.union([
  dailyInventoryRealizationListSchema,
  z
    .object({ data: dailyInventoryRealizationListSchema })
    .transform((p) => p.data),
]);
export const dailyInventoryRealizationItemResponseSchema = z.union([
  dailyInventoryRealizationItemSchema,
  z
    .object({ data: dailyInventoryRealizationItemSchema })
    .transform((p) => p.data),
]);

// Daily usage report item
export const dailyUsageReportItemSchema = z.object({
  date: z.string(),
  inventory_item_id: z.string().uuid(),
  inventory_item_name: z.string(),
  unit: z.string(),
  current_stock: z
    .number()
    .nullable()
    .optional()
    .transform((v) => v ?? undefined),
  planned_usage_qty: z.number(),
  actual_usage_qty: z.number().nullable().transform((v) => v ?? 0),
  waste_qty: z.number().nullable().transform((v) => v ?? 0),
  variance_qty: z.number().nullable().transform((v) => v ?? 0),
  status: z
    .enum(["NOT_PLANNED", "PLANNED", "DRAFT", "SUBMITTED"])
    .nullable()
    .transform((v) => v ?? "PLANNED"),
  notes: z.string().nullable().optional(),
});
export const dailyUsageReportListSchema = z.array(dailyUsageReportItemSchema);
export const dailyUsageReportResponseSchema = z.union([
  dailyUsageReportListSchema,
  z.object({ data: dailyUsageReportListSchema }).transform((p) => p.data),
]);

// Input schemas
export const createPlanItemInputSchema = z.object({
  inventory_item_id: z.string().uuid("ID bahan tidak valid"),
  planned_usage_qty: z.coerce
    .number()
    .int("Rencana penggunaan harus bilangan bulat")
    .nonnegative("Rencana penggunaan tidak boleh negatif"),
  unit: z
    .string()
    .min(1, "Satuan wajib diisi")
    .max(50, "Satuan maksimal 50 karakter"),
  notes: z.string().optional(),
});
export const createDailyPlansInputSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  items: z.array(createPlanItemInputSchema).min(1, "Minimal satu bahan"),
});
export const updatePlanItemInputSchema = z.object({
  planned_usage_qty: z.coerce
    .number()
    .int("Rencana penggunaan harus bilangan bulat")
    .nonnegative("Rencana penggunaan tidak boleh negatif")
    .optional(),
  notes: z.string().optional(),
});
export const createRealizationItemInputSchema = z.object({
  inventory_item_id: z.string().uuid("ID bahan tidak valid"),
  actual_usage_qty: z.coerce
    .number()
    .int("Penggunaan aktual harus bilangan bulat")
    .nonnegative("Penggunaan aktual tidak boleh negatif"),
  waste_qty: z.coerce
    .number()
    .int("Waste harus bilangan bulat")
    .nonnegative("Waste tidak boleh negatif"),
  remaining_qty: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});
export const createDailyRealizationsInputSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  items: z.array(createRealizationItemInputSchema).min(1, "Minimal satu bahan"),
});

// Exported types
export type DailyInventoryPlanItem = z.infer<
  typeof dailyInventoryPlanItemSchema
>;
export type DailyInventoryRealizationItem = z.infer<
  typeof dailyInventoryRealizationItemSchema
>;
export type DailyUsageReportItem = z.infer<typeof dailyUsageReportItemSchema>;
export type CreateDailyPlansInput = z.infer<typeof createDailyPlansInputSchema>;
export type UpdatePlanItemInput = z.infer<typeof updatePlanItemInputSchema>;
export type CreateDailyRealizationsInput = z.infer<
  typeof createDailyRealizationsInputSchema
>;
