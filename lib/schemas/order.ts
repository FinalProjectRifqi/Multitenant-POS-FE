import { z } from "zod";

// ── Status ────────────────────────────────────────────────────────────────────

export const kdsStatusSchema = z.enum([
  "menunggu",
  "diproses",
  "siap_disajikan",
]);

export type KdsStatus = z.infer<typeof kdsStatusSchema>;

export const orderIdSchema = z.string().uuid("ID pesanan tidak valid");

const statusFromApiSchema = z
  .string()
  .transform((value) => value.toLowerCase().replace(/ /g, "_"))
  .pipe(kdsStatusSchema);

// ── Order Item ────────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  order_item_id: z.string().uuid(),
  menu_item_id: z.string().uuid(),
  menu_item_name: z.string(),
  quantity: z.number().int().positive(),
  item_price: z.number(),
  notes: z.string().nullable().optional(),
});

export type OrderItemEntity = z.infer<typeof orderItemSchema>;

// ── Order ─────────────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  order_id: z.string().uuid(),
  order_number: z.string(),
  table_number: z.string(),
  customer_name: z.string(),
  kds_status: statusFromApiSchema,
  order_type: z.string(),
  notes: z.string().nullable().optional(),
  ordered_at: z.string(),
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
});

export type OrderEntity = z.infer<typeof orderSchema>;

// ── List response (handles both array and { data: [...] }) ────────────────────

export const ordersListResponseSchema = z.union([
  z.array(orderSchema),
  z.object({ data: z.array(orderSchema) }).transform((p) => p.data),
]);

// ── Write payloads ────────────────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  kds_status: kdsStatusSchema,
});

export type UpdateOrderStatusPayload = z.infer<typeof updateOrderStatusSchema>;

export type UpdateOrderStatusInput = {
  order_id: string;
  payload: UpdateOrderStatusPayload;
};
