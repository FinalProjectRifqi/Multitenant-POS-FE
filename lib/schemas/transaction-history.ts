import { z } from "zod";

export const transactionHistoryPaymentMethodSchema = z.enum([
  "cash",
  "cashless",
]);

export const transactionHistorySortBySchema = z.enum([
  "ordered_at",
  "completed_at",
  "total_amount",
  "customer_name",
  "payment_status",
]);

export const transactionHistorySortTypeSchema = z.enum(["ASC", "DESC"]);

export const transactionHistoryPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  reference_number: z.string(),
  payment_status: z.string(),
  payment_method: transactionHistoryPaymentMethodSchema,
  amount: z.number(),
  paid_at: z.string().nullable(),
});

export const transactionHistoryItemSchema = z.object({
  order_id: z.string().uuid(),
  order_number: z.string(),
  business_unit_id: z.string().uuid(),
  business_unit_name: z.string().nullable(),
  customer_name: z.string(),
  table_number: z.string().nullable(),
  order_type_id: z.string().uuid(),
  order_type_name: z.string(),
  total_amount: z.number(),
  order_status_id: z.string().uuid(),
  order_status_name: z.string(),
  ordered_at: z.string(),
  completed_at: z.string().nullable(),
  payment: transactionHistoryPaymentSchema.nullable(),
});

export const transactionHistoryResponseSchema = z.object({
  success: z.literal(true),
  statusCode: z.literal(200),
  message: z.string(),
  data: z.array(transactionHistoryItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type TransactionHistoryResponseSchema = z.infer<
  typeof transactionHistoryResponseSchema
>;
