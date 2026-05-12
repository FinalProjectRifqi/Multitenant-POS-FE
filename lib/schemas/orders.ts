// lib/schemas/orders.ts

import { z } from "zod";

export const orderTypeSchema = z.object({
  order_type_id: z.string().uuid(),
  order_type_name: z.string(),
  order_type_code: z.string(),
});

export const orderItemResponseSchema = z.object({
  order_item_id: z.string().uuid(),
  menu_item_id: z.string().uuid(),
  menu_item_name: z.string(),
  quantity: z.number(),
  item_price: z.number(),
  subtotal: z.number(),
  notes: z.string().nullable(),
});

export const orderListItemSchema = z.object({
  order_id: z.string().uuid(),
  order_number: z.string(),
  customer_name: z.string(),
  table_number: z.string().nullable(),
  order_type_id: z.string().uuid(),
  order_type_name: z.string(),
  total_amount: z.number(),
  order_status_id: z.string().uuid(),
  order_status_name: z.string(),
  ordered_at: z.string(),
  updated_at: z.string().optional(),
});

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const posOrdersListResponseSchema = z.object({
  success: z.literal(true),
  statusCode: z.literal(200),
  message: z.string(),
  data: z.array(orderListItemSchema),
  meta: paginationMetaSchema,
});

export const orderDetailSchema = orderListItemSchema.extend({
  unit_id: z.string().uuid(),
  user_id: z.string().uuid(),
  notes: z.string().nullable(),
  subtotal: z.number(),
  tax_amount: z.number(),
  completed_at: z.string().nullable(),
  items: z.array(orderItemResponseSchema),
});

export const orderDetailResponseSchema = z.object({
  success: z.literal(true),
  statusCode: z.number(),
  message: z.string(),
  data: orderDetailSchema,
});

export const paymentRecordSchema = z.object({
  payment_id: z.string(),
  order_id: z.string(),
  reference_number: z.string(),
  amount: z.number(),
  payment_status: z.string(),
  failure_reason: z.string().nullable(),
  paid_at: z.string().nullable(),
  expired_at: z.string().nullable(),
  created_at: z.string(),
});

export const cashPaymentResponseSchema = z.object({
  success: z.literal(true),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    payment: paymentRecordSchema,
  }),
});

export const cashlessPaymentResponseSchema = z.object({
  success: z.literal(true),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    payment: paymentRecordSchema,
    snap_token: z.string(),
    redirect_url: z.string(),
    webhook_signature_key: z.string(),
  }),
});

export const orderTypesListResponseSchema = z.object({
  success: z.literal(true),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(orderTypeSchema),
  meta: paginationMetaSchema,
});

export type PosOrdersListResponse = z.infer<typeof posOrdersListResponseSchema>;
export type OrderDetailResponse = z.infer<typeof orderDetailResponseSchema>;
export type CashPaymentResponse = z.infer<typeof cashPaymentResponseSchema>;
export type CashlessPaymentResponse = z.infer<
  typeof cashlessPaymentResponseSchema
>;
export type OrderTypesListResponse = z.infer<
  typeof orderTypesListResponseSchema
>;
