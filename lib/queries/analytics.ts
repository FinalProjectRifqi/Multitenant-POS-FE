"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getAnalyticsDailyInventory,
  getAnalyticsInventoryStatus,
  getAnalyticsKpi,
  getAnalyticsRecentPayments,
  getAnalyticsSalesTrend,
  getAnalyticsTopMenus,
} from "@/lib/api/analytics";
import type { AnalyticsPeriod } from "@/lib/types/analytics";

export const analyticsQueryKeys = {
  kpi: (unitId: string, period: AnalyticsPeriod) =>
    ["analytics", unitId, "kpi", period] as const,
  salesTrend: (unitId: string, period: AnalyticsPeriod) =>
    ["analytics", unitId, "sales-trend", period] as const,
  topMenus: (unitId: string, period: AnalyticsPeriod) =>
    ["analytics", unitId, "top-menus", period] as const,
  payments: (unitId: string) => ["analytics", unitId, "payments"] as const,
  inventoryStatus: (unitId: string) =>
    ["analytics", unitId, "inventory-status"] as const,
  dailyInventory: (unitId: string, date?: string) =>
    ["analytics", unitId, "daily-inventory", date ?? "today"] as const,
};

export function useAnalyticsKpi(unitId: string, period: AnalyticsPeriod) {
  return useQuery({
    queryKey: analyticsQueryKeys.kpi(unitId, period),
    queryFn: () => getAnalyticsKpi(unitId, period),
    enabled: !!unitId,
  });
}

export function useAnalyticsSalesTrend(
  unitId: string,
  period: AnalyticsPeriod,
) {
  return useQuery({
    queryKey: analyticsQueryKeys.salesTrend(unitId, period),
    queryFn: () => getAnalyticsSalesTrend(unitId, period),
    enabled: !!unitId,
  });
}

export function useAnalyticsTopMenus(unitId: string, period: AnalyticsPeriod) {
  return useQuery({
    queryKey: analyticsQueryKeys.topMenus(unitId, period),
    queryFn: () => getAnalyticsTopMenus(unitId, period),
    enabled: !!unitId,
  });
}

export function useAnalyticsRecentPayments(unitId: string) {
  return useQuery({
    queryKey: analyticsQueryKeys.payments(unitId),
    queryFn: () => getAnalyticsRecentPayments(unitId),
    enabled: !!unitId,
  });
}

export function useAnalyticsInventoryStatus(unitId: string) {
  return useQuery({
    queryKey: analyticsQueryKeys.inventoryStatus(unitId),
    queryFn: () => getAnalyticsInventoryStatus(unitId),
    enabled: !!unitId,
  });
}

export function useAnalyticsDailyInventory(unitId: string, date?: string) {
  return useQuery({
    queryKey: analyticsQueryKeys.dailyInventory(unitId, date),
    queryFn: () => getAnalyticsDailyInventory(unitId, date),
    enabled: !!unitId,
  });
}
