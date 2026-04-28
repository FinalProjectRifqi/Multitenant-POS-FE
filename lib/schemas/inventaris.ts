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

// ─── Exported TypeScript types ─────────────────────────────────────────────────

export type InventarisItem = z.infer<typeof inventarisItemSchema>;
