// lib/api/pos-orders.ts — Server Actions for POS order management.
"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { parseApiError } from "@/lib/api/parsed-api-error";
import type {
  CreateOrderPayload,
  GetOrdersParams,
  PaymentPayload,
  UpdateOrderPayload,
} from "@/lib/orders/types";
import {
  cashlessPaymentResponseSchema,
  cashPaymentResponseSchema,
  orderDetailResponseSchema,
  orderTypesListResponseSchema,
  posOrdersListResponseSchema,
  type CashlessPaymentResponse,
  type CashPaymentResponse,
  type OrderDetailResponse,
  type OrderTypesListResponse,
  type PosOrdersListResponse,
} from "@/lib/schemas/orders";

// ─── Endpoint builders ─────────────────────────────────────────────────────────

function ordersEndpoint(unitId: string): string {
  return `/orders/${unitId}`;
}

function orderDetailEndpoint(unitId: string, orderId: string): string {
  return `/orders/${unitId}/${orderId}`;
}

function paymentEndpoint(
  unitId: string,
  orderId: string,
  method: "cash" | "cashless",
): string {
  return `/orders/${unitId}/${orderId}/payments/${method}`;
}

function orderStatusTransitionEndpoint(
  unitId: string,
  orderId: string,
): string {
  return `/order-status/${unitId}/${orderId}/transition`;
}

function orderStatusCancelEndpoint(unitId: string, orderId: string): string {
  return `/order-status/${unitId}/${orderId}/cancel`;
}

const ORDER_TYPES_ENDPOINT = "/order-types";

// ─── Result types ──────────────────────────────────────────────────────────────

export type PosOrderMutationResult<TData = void> =
  | { ok: true; data: TData }
  | { ok: false; status: number; message: string };

// ─── Query functions ───────────────────────────────────────────────────────────

export async function getPosOrders(
  unitId: string,
  params?: GetOrdersParams,
): Promise<PosOrdersListResponse> {
  return apiGet<PosOrdersListResponse>(ordersEndpoint(unitId), {
    schema: posOrdersListResponseSchema,
    params: params as Record<string, unknown> | undefined,
  });
}

export async function getPosOrderDetail(
  unitId: string,
  orderId: string,
): Promise<OrderDetailResponse> {
  return apiGet<OrderDetailResponse>(orderDetailEndpoint(unitId, orderId), {
    schema: orderDetailResponseSchema,
  });
}

export async function getOrderTypes(params?: {
  page?: number;
  limit?: number;
}): Promise<OrderTypesListResponse> {
  return apiGet<OrderTypesListResponse>(ORDER_TYPES_ENDPOINT, {
    schema: orderTypesListResponseSchema,
    params: params ?? { limit: 100 },
  });
}

// ─── Mutation functions ────────────────────────────────────────────────────────

export async function createPosOrder(
  unitId: string,
  payload: CreateOrderPayload,
): Promise<PosOrderMutationResult<OrderDetailResponse["data"]>> {
  try {
    const result = await apiPost<OrderDetailResponse, CreateOrderPayload>(
      ordersEndpoint(unitId),
      payload,
      { schema: orderDetailResponseSchema },
    );
    return { ok: true, data: result.data };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    return { ok: false, status: parsed.status, message: parsed.message };
  }
}

export async function updatePosOrder(
  unitId: string,
  orderId: string,
  payload: UpdateOrderPayload,
): Promise<PosOrderMutationResult<OrderDetailResponse["data"]>> {
  try {
    const result = await apiPatch<OrderDetailResponse, UpdateOrderPayload>(
      orderDetailEndpoint(unitId, orderId),
      payload,
      { schema: orderDetailResponseSchema },
    );
    return { ok: true, data: result.data };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    return { ok: false, status: parsed.status, message: parsed.message };
  }
}

export async function cancelPosOrder(
  unitId: string,
  orderId: string,
): Promise<PosOrderMutationResult<void>> {
  try {
    await apiDelete(orderDetailEndpoint(unitId, orderId));
    return { ok: true, data: undefined };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    return { ok: false, status: parsed.status, message: parsed.message };
  }
}

export async function createCashPayment(
  unitId: string,
  orderId: string,
  payload: PaymentPayload,
): Promise<PosOrderMutationResult<CashPaymentResponse["data"]>> {
  try {
    const result = await apiPost<CashPaymentResponse, PaymentPayload>(
      paymentEndpoint(unitId, orderId, "cash"),
      payload,
      { schema: cashPaymentResponseSchema },
    );
    return { ok: true, data: result.data };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    return { ok: false, status: parsed.status, message: parsed.message };
  }
}

export async function createCashlessPayment(
  unitId: string,
  orderId: string,
  payload: PaymentPayload,
): Promise<PosOrderMutationResult<CashlessPaymentResponse["data"]>> {
  try {
    const result = await apiPost<CashlessPaymentResponse, PaymentPayload>(
      paymentEndpoint(unitId, orderId, "cashless"),
      payload,
      { schema: cashlessPaymentResponseSchema },
    );
    return { ok: true, data: result.data };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    return { ok: false, status: parsed.status, message: parsed.message };
  }
}

export async function transitionOrderStatus(
  unitId: string,
  orderId: string,
  orderStatusId: string,
): Promise<PosOrderMutationResult<OrderDetailResponse["data"]>> {
  try {
    const result = await apiPost<
      OrderDetailResponse,
      { order_status_id: string }
    >(
      orderStatusTransitionEndpoint(unitId, orderId),
      {
        order_status_id: orderStatusId,
      },
      {
        schema: orderDetailResponseSchema,
      },
    );
    return { ok: true, data: result.data };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    return { ok: false, status: parsed.status, message: parsed.message };
  }
}

export async function cancelOrderStatus(
  unitId: string,
  orderId: string,
): Promise<PosOrderMutationResult<void>> {
  try {
    await apiPost(orderStatusCancelEndpoint(unitId, orderId), undefined);
    return { ok: true, data: undefined };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    return { ok: false, status: parsed.status, message: parsed.message };
  }
}
