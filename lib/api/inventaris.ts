// ─────────────────────────────────────────────
// lib/api/inventaris.ts
// ─────────────────────────────────────────────
"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { parseApiError } from "@/lib/api/parsed-api-error";
import {
  inventarisItemResponseSchema,
  inventarisListResponseSchema,
  inventarisStatsSchema,
  type InventarisItem,
  type InventarisItemFormValues,
  type InventarisListResponse,
  type InventarisStats,
} from "@/lib/schemas/inventaris";

const INVENTARIS_ENDPOINT = "/inventaris";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InventarisMutationResult<TData = void> =
  | { ok: true; data: TData }
  | { ok: false; status: number; message: string };

export type ListInventarisParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortType?: "asc" | "desc";
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInventarisMutationError(
  error: unknown,
): InventarisMutationResult<never> {
  const parsed = parseApiError(error);
  return { ok: false, status: parsed.status, message: parsed.message };
}

// ─── Read operations ──────────────────────────────────────────────────────────

export async function getInventarisItems(
  businessId: string,
  params?: ListInventarisParams,
): Promise<InventarisListResponse> {
  return apiGet<InventarisListResponse>(
    `${INVENTARIS_ENDPOINT}/${businessId}/items`,
    {
      schema: inventarisListResponseSchema,
      params,
    },
  );
}

export async function getInventarisStats(
  businessId: string,
): Promise<InventarisStats> {
  return apiGet<InventarisStats>(`${INVENTARIS_ENDPOINT}/${businessId}/stats`, {
    schema: inventarisStatsSchema,
  });
}

// ─── Write operations ─────────────────────────────────────────────────────────

export async function createInventarisItem(
  businessId: string,
  payload: InventarisItemFormValues,
): Promise<InventarisMutationResult<InventarisItem>> {
  try {
    const data = await apiPost<InventarisItem, InventarisItemFormValues>(
      `${INVENTARIS_ENDPOINT}/${businessId}/items`,
      payload,
      { schema: inventarisItemResponseSchema },
    );
    return { ok: true, data };
  } catch (error) {
    return toInventarisMutationError(error);
  }
}

export async function updateInventarisItem(
  businessId: string,
  inventoryItemId: string,
  payload: InventarisItemFormValues,
): Promise<InventarisMutationResult<InventarisItem>> {
  try {
    const data = await apiPatch<InventarisItem, InventarisItemFormValues>(
      `${INVENTARIS_ENDPOINT}/${businessId}/items/${inventoryItemId}`,
      payload,
      { schema: inventarisItemResponseSchema },
    );
    return { ok: true, data };
  } catch (error) {
    return toInventarisMutationError(error);
  }
}

export async function deleteInventarisItem(
  businessId: string,
  inventoryItemId: string,
): Promise<InventarisMutationResult<void>> {
  try {
    await apiDelete(
      `${INVENTARIS_ENDPOINT}/${businessId}/items/${inventoryItemId}`,
    );
    return { ok: true, data: undefined };
  } catch (error) {
    return toInventarisMutationError(error);
  }
}
