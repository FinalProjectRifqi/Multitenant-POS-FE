"use client";

import { InventoryStatusSection } from "@/components/analytics/inventory-status-section";
import { KpiCards } from "@/components/analytics/kpi-cards";
import { PaymentHistorySection } from "@/components/analytics/payment-history-section";
import { SalesTrendChart } from "@/components/analytics/sales-trend-chart";
import {
  MenuRevenueList,
  TopMenusSection,
} from "@/components/analytics/top-menus-section";
import { useCurrentUserContext } from "@/components/dashboard/current-user-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAnalyticsInventoryStatus,
  useAnalyticsKpi,
  useAnalyticsRecentPayments,
  useAnalyticsSalesTrend,
  useAnalyticsTopMenus,
} from "@/lib/queries/analytics";
import type { AnalyticsPeriod } from "@/lib/types/analytics";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "30d", label: "30 Hari Terakhir" },
  { value: "month", label: "Bulan Ini" },
  { value: "quarter", label: "3 Bulan Terakhir" },
];

export function UnitAnalyticsReportPage() {
  const { data: session } = useSession();
  const unitId = session?.user?.unit_id ?? "";
  const currentUser = useCurrentUserContext();
  const unitName = currentUser?.business_units?.[0]?.business_unit_name ?? "";

  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");

  const kpiQuery = useAnalyticsKpi(unitId, period);
  const trendQuery = useAnalyticsSalesTrend(unitId, period);
  const topMenusQuery = useAnalyticsTopMenus(unitId, period);
  const paymentsQuery = useAnalyticsRecentPayments(unitId);
  const inventoryStatusQuery = useAnalyticsInventoryStatus(unitId);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-normal">
            Laporan & Analitik
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Pantau performa penjualan & omzet unit Anda secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}
          >
            <SelectTrigger className="w-44 bg-primary-foreground font-medium">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="">
          {/* Top Menus Table */}
          <TopMenusSection
            data={topMenusQuery.data?.data}
            isLoading={topMenusQuery.isLoading}
          />
        </div>
        <div>
          {/* Payment History */}
          <PaymentHistorySection
            data={paymentsQuery.data?.data}
            isLoading={paymentsQuery.isLoading}
            redirectToTransaksi
            redirectToTransaksiUrl={`/unit/transaksi`}
          />
        </div>
      </div>

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
