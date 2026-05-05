import { z } from "zod";

// ─── Entity schema ─────────────────────────────────────────────────────────────

export const inventarisItemSchema = z.object({
  inventory_item_id: z.string().uuid(),
  inventory_item_name: z.string().min(1),
  description: z.string(),
  unit_of_measure: z.string().min(1),
  current_stock: z.number().int().nonnegative(),
  min_threshold: z.number().int().nonnegative(),
  max_threshold: z.number().int().positive(),
  last_restocked_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const inventarisItemResponseSchema = z
  .object({ data: inventarisItemSchema })
  .transform((p) => p.data);

export const inventarisListResponseSchema = z
  .object({
    data: z.array(inventarisItemSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
  .transform((p) => ({ data: p.data, meta: p.meta }));

export const inventarisStatsSchema = z
  .object({
    data: z.object({
      total_inventory_item: z.number(),
      inventory_item_low_stock: z.number(),
      inventory_item_normal_stock: z.number(),
      inventory_item_out_of_stock: z.number(),
    }),
  })
  .transform((p) => p.data);

// ─── Form / request schema ─────────────────────────────────────────────────────

export const inventarisItemFormSchema = z
  .object({
    inventory_item_name: z.string().min(1, "Nama barang wajib diisi"),
    unit_of_measure: z.string().min(1, "Satuan pengukuran wajib diisi"),
    current_stock: z.coerce
      .number({ error: "Stok harus berupa angka" })
      .int("Stok harus bilangan bulat")
      .nonnegative("Stok tidak boleh negatif"),
    max_threshold: z.coerce
      .number({ error: "Batas maksimum harus berupa angka" })
      .int("Batas maksimum harus bilangan bulat")
      .positive("Batas maksimum harus lebih dari 0"),
    min_threshold: z.coerce
      .number({ error: "Batas minimum harus berupa angka" })
      .int("Batas minimum harus bilangan bulat")
      .nonnegative("Batas minimum tidak boleh negatif"),
    description: z.string(),
  })
  .refine((data) => data.min_threshold < data.max_threshold, {
    message: "Batas minimum harus lebih kecil dari batas maksimum",
    path: ["min_threshold"],
  });

// ─── Exported TypeScript types ─────────────────────────────────────────────────

export type InventarisItem = z.infer<typeof inventarisItemSchema>;
export type InventarisItemFormValues = z.infer<typeof inventarisItemFormSchema>;
export type InventarisListResponse = z.infer<
  typeof inventarisListResponseSchema
>;
export type InventarisStats = z.infer<typeof inventarisStatsSchema>;
