import { z } from "zod";

// ─── Entity schema ─────────────────────────────────────────────────────────────

export const inventarisItemSchema = z.object({
  inventaris_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  item_name: z.string().min(1),
  unit_of_measurement: z.string().min(1),
  current_stock: z.number().int().nonnegative(),
  max_stock: z.number().int().positive(),
  min_stock: z.number().int().nonnegative(),
  description: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const inventarisListResponseSchema = z.array(inventarisItemSchema);

// ─── Form / request schema ─────────────────────────────────────────────────────

export const inventarisItemFormSchema = z
  .object({
    item_name: z.string().min(1, "Nama barang wajib diisi"),
    unit_of_measurement: z.string().min(1, "Satuan pengukuran wajib diisi"),
    current_stock: z.coerce
      .number({ invalid_type_error: "Stok harus berupa angka" })
      .int("Stok harus bilangan bulat")
      .nonnegative("Stok tidak boleh negatif"),
    max_stock: z.coerce
      .number({ invalid_type_error: "Batas maksimum harus berupa angka" })
      .int("Batas maksimum harus bilangan bulat")
      .positive("Batas maksimum harus lebih dari 0"),
    min_stock: z.coerce
      .number({ invalid_type_error: "Batas minimum harus berupa angka" })
      .int("Batas minimum harus bilangan bulat")
      .nonnegative("Batas minimum tidak boleh negatif"),
    description: z.string(),
  })
  .refine((data) => data.min_stock < data.max_stock, {
    message: "Batas minimum harus lebih kecil dari batas maksimum",
    path: ["min_stock"],
  });

// ─── Exported TypeScript types ─────────────────────────────────────────────────

export type InventarisItem = z.infer<typeof inventarisItemSchema>;
export type InventarisItemFormValues = z.infer<typeof inventarisItemFormSchema>;
