"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiCards } from "@/components/analytics/kpi-cards";
import { useCurrentUserContext } from "@/components/dashboard/current-user-context";
import { SalesTrendChart } from "@/components/analytics/sales-trend-chart";
import {
  TopMenusSection,
  MenuRevenueList,
} from "@/components/analytics/top-menus-section";
import { PaymentHistorySection } from "@/components/analytics/payment-history-section";
import { InventoryStatusSection } from "@/components/analytics/inventory-status-section";
import { DailyInventorySection } from "@/components/analytics/daily-inventory-section";
import {
  useAnalyticsKpi,
  useAnalyticsSalesTrend,
  useAnalyticsTopMenus,
  useAnalyticsRecentPayments,
  useAnalyticsInventoryStatus,
  useAnalyticsDailyInventory,
} from "@/lib/queries/analytics";
import type { AnalyticsPeriod } from "@/lib/types/analytics";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "30d", label: "30 Hari Terakhir" },
  { value: "month", label: "Bulan Ini" },
  { value: "quarter", label: "3 Bulan Terakhir" },
];

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AnalyticsReportPage() {
  const { data: session } = useSession();
  const unitId = session?.user?.unit_id ?? "";
  const currentUser = useCurrentUserContext();
  const unitName = currentUser?.business_units?.[0]?.business_unit_name ?? "";

  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const [dailyDate, setDailyDate] = useState<string>(getTodayDateString);

  const kpiQuery = useAnalyticsKpi(unitId, period);
  const trendQuery = useAnalyticsSalesTrend(unitId, period);
  const topMenusQuery = useAnalyticsTopMenus(unitId, period);
  const paymentsQuery = useAnalyticsRecentPayments(unitId);
  const inventoryStatusQuery = useAnalyticsInventoryStatus(unitId);
  const dailyInventoryQuery = useAnalyticsDailyInventory(unitId, dailyDate);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau performa penjualan & omzet unit Anda secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}
          >
            <SelectTrigger className="w-44 bg-primary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-primary-foreground">
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards
        data={kpiQuery.data?.data}
        isLoading={kpiQuery.isLoading}
        unitName={unitName}
      />

      {/* Sales Trend + Pendapatan per Menu */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesTrendChart
            data={trendQuery.data?.data}
            isLoading={trendQuery.isLoading}
          />
        </div>
        <div>
          <MenuRevenueList
            data={topMenusQuery.data?.data}
            isLoading={topMenusQuery.isLoading}
          />
        </div>
      </div>

      {/* Top Menus Table */}
      <TopMenusSection
        data={topMenusQuery.data?.data}
        isLoading={topMenusQuery.isLoading}
      />

      {/* Payment History */}
      <PaymentHistorySection
        data={paymentsQuery.data?.data}
        isLoading={paymentsQuery.isLoading}
      />

      {/* Inventory Status */}
      <InventoryStatusSection
        data={inventoryStatusQuery.data?.data}
        isLoading={inventoryStatusQuery.isLoading}
      />

      {/* Daily Inventory */}
      {/* <DailyInventorySection
        data={dailyInventoryQuery.data?.data}
        isLoading={dailyInventoryQuery.isLoading}
        date={dailyDate}
        onDateChange={setDailyDate}
      /> */}
    </div>
  );
}
