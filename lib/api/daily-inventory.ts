"use server";

import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { parseApiError } from "@/lib/api/parsed-api-error";
import {
  dailyInventoryPlanItemResponseSchema,
  dailyInventoryRealizationItemResponseSchema,
  dailyInventoryRealizationListResponseSchema,
  dailyUsageReportResponseSchema,
  updatePlanItemInputSchema,
  type DailyInventoryPlanItem,
  type DailyInventoryRealizationItem,
  type DailyUsageReportItem,
  type CreateDailyPlansInput,
  type UpdatePlanItemInput,
  type CreateDailyRealizationsInput,
  dailyInventoryPlanListResponseSchema,
} from "@/lib/schemas/daily-inventory";

const INVENTORY_ENDPOINT = "/inventory";

export type DailyInventoryMutationResult<TData = void> =
  | { ok: true; data: TData }
  | { ok: false; status: number; message: string };

function plansEndpoint(unitId: string, date?: string): string {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return `${INVENTORY_ENDPOINT}/${unitId}/daily-plans${query}`;
}

function planItemEndpoint(unitId: string, planId: string): string {
  return `${INVENTORY_ENDPOINT}/${unitId}/daily-plans/${planId}`;
}

function realizationsEndpoint(unitId: string, date?: string): string {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return `${INVENTORY_ENDPOINT}/${unitId}/daily-realizations${query}`;
}

function realizationSubmitEndpoint(
  unitId: string,
  realizationId: string,
): string {
  return `${INVENTORY_ENDPOINT}/${unitId}/daily-realizations/${realizationId}/submit`;
}

function dailyUsageReportEndpoint(unitId: string, date: string): string {
  return `${INVENTORY_ENDPOINT}/${unitId}/reports/daily-usage?date=${encodeURIComponent(date)}`;
}

function toMutationError(error: unknown): DailyInventoryMutationResult<never> {
  const parsed = parseApiError(error);
  return { ok: false, status: parsed.status, message: parsed.message };
}

export async function getDailyPlans(
  unitId: string,
  date: string,
): Promise<DailyInventoryPlanItem[]> {
  return apiGet<DailyInventoryPlanItem[]>(plansEndpoint(unitId, date), {
    schema: dailyInventoryPlanListResponseSchema,
  });
}

export async function getDailyRealizations(
  unitId: string,
  date: string,
): Promise<DailyInventoryRealizationItem[]> {
  return apiGet<DailyInventoryRealizationItem[]>(
    realizationsEndpoint(unitId, date),
    {
      schema: dailyInventoryRealizationListResponseSchema,
    },
  );
}

export async function getDailyUsageReport(
  unitId: string,
  date: string,
): Promise<DailyUsageReportItem[]> {
  return apiGet<DailyUsageReportItem[]>(
    dailyUsageReportEndpoint(unitId, date),
    {
      schema: dailyUsageReportResponseSchema,
    },
  );
}

/**
 * Creates daily plan items one at a time (backend DTO is flat per-item,
 * not a nested { items: [...] } envelope).
 * All requests run in parallel; the first failure short-circuits the result.
 */
export async function createDailyPlans(
  unitId: string,
  payload: CreateDailyPlansInput,
): Promise<DailyInventoryMutationResult<DailyInventoryPlanItem[]>> {
  try {
    const results = await Promise.all(
      payload.items.map(async (item) => {
        try {
          return await apiPost<DailyInventoryPlanItem>(
            plansEndpoint(unitId),
            {
              date: payload.date,
              inventory_item_id: item.inventory_item_id,
              planned_usage_qty: item.planned_usage_qty,
              unit: item.unit,
              ...(item.notes ? { notes: item.notes } : {}),
            },
            { schema: dailyInventoryPlanItemResponseSchema },
          );
        } catch (error) {
          const parsed = parseApiError(error);
          if (parsed.status === 409) return null;
          throw error;
        }
      }),
    );
    return {
      ok: true,
      data: results.filter((item): item is DailyInventoryPlanItem =>
        Boolean(item),
      ),
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function updateDailyPlanItem(
  unitId: string,
  planId: string,
  payload: UpdatePlanItemInput,
): Promise<DailyInventoryMutationResult<DailyInventoryPlanItem>> {
  try {
    const parsed = updatePlanItemInputSchema.parse(payload);
    const data = await apiPatch<DailyInventoryPlanItem>(
      planItemEndpoint(unitId, planId),
      parsed,
      {
        schema: dailyInventoryPlanItemResponseSchema,
      },
    );
    return { ok: true, data };
  } catch (error) {
    return toMutationError(error);
  }
}

/**
 * Creates daily realization items one at a time (backend DTO is flat per-item).
 * All requests run in parallel; the first failure short-circuits the result.
 */
export async function createDailyRealizations(
  unitId: string,
  payload: CreateDailyRealizationsInput,
): Promise<DailyInventoryMutationResult<DailyInventoryRealizationItem[]>> {
  try {
    const results = await Promise.all(
      payload.items.map(async (item) => {
        try {
          return await apiPost<DailyInventoryRealizationItem>(
            realizationsEndpoint(unitId),
            {
              date: payload.date,
              inventory_item_id: item.inventory_item_id,
              actual_usage_qty: item.actual_usage_qty,
              waste_qty: item.waste_qty,
              ...(item.remaining_qty !== undefined
                ? { remaining_qty: item.remaining_qty }
                : {}),
              ...(item.notes ? { notes: item.notes } : {}),
            },
            { schema: dailyInventoryRealizationItemResponseSchema },
          );
        } catch (error) {
          const parsed = parseApiError(error);
          if (parsed.status === 409) return null;
          throw error;
        }
      }),
    );
    return {
      ok: true,
      data: results.filter((item): item is DailyInventoryRealizationItem =>
        Boolean(item),
      ),
    };
  } catch (error) {
    return toMutationError(error);
  }
}

export async function submitDailyRealization(
  unitId: string,
  realizationId: string,
): Promise<DailyInventoryMutationResult<DailyInventoryRealizationItem>> {
  try {
    const data = await apiPost<DailyInventoryRealizationItem>(
      realizationSubmitEndpoint(unitId, realizationId),
      undefined,
      { schema: dailyInventoryRealizationItemResponseSchema },
    );
    return { ok: true, data };
  } catch (error) {
    return toMutationError(error);
  }
}
