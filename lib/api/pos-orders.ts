// lib/api/pos-orders.ts — Server Actions for POS order management.
"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { parseApiError } from "@/lib/api/parsed-api-error";
import type {
  CreateOrderPayload,
  GetOrdersParams,
  UpdateOrderPayload,
} from "@/lib/orders/types";
import {
  orderDetailResponseSchema,
  orderTypesListResponseSchema,
  posOrdersListResponseSchema,
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
