"use server";

import { apiGet } from "@/lib/api/client";
import type {
  AnalyticsDailyInventoryResponse,
  AnalyticsInventoryStatusResponse,
  AnalyticsKpiResponse,
  AnalyticsPaymentsResponse,
  AnalyticsPeriod,
  AnalyticsSalesTrendResponse,
  AnalyticsTopMenusResponse,
} from "@/lib/types/analytics";

const BASE = "/analytics";

export async function getAnalyticsKpi(
  unitId: string,
  period: AnalyticsPeriod = "7d",
): Promise<AnalyticsKpiResponse> {
  return apiGet<AnalyticsKpiResponse>(`${BASE}/${unitId}/kpi`, {
    params: { period },
  });
}

export async function getAnalyticsSalesTrend(
  unitId: string,
  period: AnalyticsPeriod = "7d",
): Promise<AnalyticsSalesTrendResponse> {
  return apiGet<AnalyticsSalesTrendResponse>(`${BASE}/${unitId}/sales-trend`, {
    params: { period },
  });
}

export async function getAnalyticsTopMenus(
  unitId: string,
  period: AnalyticsPeriod = "7d",
): Promise<AnalyticsTopMenusResponse> {
  return apiGet<AnalyticsTopMenusResponse>(`${BASE}/${unitId}/top-menus`, {
    params: { period },
  });
}

export async function getAnalyticsRecentPayments(
  unitId: string,
): Promise<AnalyticsPaymentsResponse> {
  return apiGet<AnalyticsPaymentsResponse>(`${BASE}/${unitId}/payments`);
}

export async function getAnalyticsInventoryStatus(
  unitId: string,
): Promise<AnalyticsInventoryStatusResponse> {
  return apiGet<AnalyticsInventoryStatusResponse>(
    `${BASE}/${unitId}/inventory-status`,
  );
}

export async function getAnalyticsDailyInventory(
  unitId: string,
  date?: string,
): Promise<AnalyticsDailyInventoryResponse> {
  return apiGet<AnalyticsDailyInventoryResponse>(
    `${BASE}/${unitId}/daily-inventory`,
    {
      params: date ? { date } : {},
    },
  );
}
