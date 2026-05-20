"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  TrendingUp,
  ShoppingCart,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DataTable } from "@/components/shared/data-table/data-table";
import { SalesTrendChart } from "@/components/analytics/sales-trend-chart";
import {
  TopMenusSection,
  MenuRevenueList,
} from "@/components/analytics/top-menus-section";
import { PaymentHistorySection } from "@/components/analytics/payment-history-section";
import { InventoryStatusSection } from "@/components/analytics/inventory-status-section";
import {
  useGroupSummary,
  useGroupCompare,
  useAnalyticsKpi,
  useAnalyticsSalesTrend,
  useAnalyticsTopMenus,
  useAnalyticsRecentPayments,
  useAnalyticsInventoryStatus,
} from "@/lib/queries/analytics";
import { useUnitsQuery } from "@/lib/queries/unit";
import type {
  AnalyticsPeriod,
  GroupKpiData,
  UnitPerformanceRow,
  UnitCompareRow,
} from "@/lib/types/analytics";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "30d", label: "30 Hari Terakhir" },
  { value: "month", label: "Bulan Ini" },
  { value: "quarter", label: "3 Bulan Terakhir" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

// ─── Group KPI Cards ──────────────────────────────────────────────────────────

function GroupKpiCards({
  data,
  isLoading,
}: {
  data?: GroupKpiData;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-primary">
            <CardContent className="p-6 flex flex-col gap-3">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Omzet",
      value: formatRupiah(data?.total_omzet ?? 0),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Transaksi",
      value: formatNumber(data?.total_transaksi ?? 0),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Rata-rata Order",
      value: formatRupiah(data?.rata_rata_order ?? 0),
      icon: Calculator,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Stok Kritis",
      value: formatNumber(data?.stok_kritis ?? 0),
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="bg-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-primary-foreground opacity-70">
                {card.title}
              </p>
              <div className={`p-2 rounded-lg bg-white/15 shrink-0`}>
                <card.icon className={`h-4 w-4 text-primary-foreground`} />
              </div>
            </div>
            <p className="text-2xl text-primary-foreground font-bold">
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Secondary KPIs ───────────────────────────────────────────────────────────

function SecondaryKpis({
  data,
  isLoading,
  bestUnit,
}: {
  data?: GroupKpiData;
  isLoading: boolean;
  bestUnit?: UnitPerformanceRow;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-primary-foreground">
            <CardContent className="p-4 ">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="bg-primary-foreground">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Order Selesai</p>
            <p className="text-lg font-bold">
              {formatNumber(data?.selesai ?? 0)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-primary-foreground">
        <CardContent className="p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Order Dibatalkan</p>
            <p className="text-lg font-bold">
              {formatNumber(data?.dibatalkan ?? 0)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-primary-foreground">
        <CardContent className="p-4 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Unit Terbaik</p>
            <p className="text-lg font-bold truncate">
              {bestUnit?.unit_name ?? "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Unit Performance Table ───────────────────────────────────────────────────

function UnitPerformanceTable({
  data,
  isLoading,
}: {
  data?: UnitPerformanceRow[];
  isLoading: boolean;
}) {
  const columns: ColumnDef<UnitPerformanceRow, unknown>[] = [
    {
      accessorKey: "unit_name",
      header: "Unit",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("unit_name")}</span>
      ),
    },
    {
      accessorKey: "omzet",
      header: () => <div className="text-left">Omzet</div>,
      cell: ({ row }) => (
        <div className="text-left">{formatRupiah(row.getValue("omzet"))}</div>
      ),
    },
    {
      accessorKey: "transaksi",
      header: () => <div className="text-left">Transaksi</div>,
      cell: ({ row }) => (
        <div className="text-left">
          {formatNumber(row.getValue("transaksi"))}
        </div>
      ),
    },
    {
      accessorKey: "rata_rata_order",
      header: () => <div className="text-left">Rata-rata</div>,
      cell: ({ row }) => (
        <div className="text-left">
          {formatRupiah(row.getValue("rata_rata_order"))}
        </div>
      ),
    },
    {
      accessorKey: "selesai",
      header: () => <div className="text-left">Selesai</div>,
      cell: ({ row }) => (
        <div className="text-justify text-emerald-400">
          {formatNumber(row.getValue("selesai"))}
        </div>
      ),
    },
    {
      accessorKey: "dibatalkan",
      header: () => <div className="text-left">Batal</div>,
      cell: ({ row }) => (
        <div className="text-justify text-red-400">
          {formatNumber(row.getValue("dibatalkan"))}
        </div>
      ),
    },
    {
      accessorKey: "stok_kritis",
      header: () => <div className="text-left">Stok Kritis</div>,
      cell: ({ row }) => {
        const val: number = row.getValue("stok_kritis");
        return (
          <div className="text-justify ">
            {val > 0 ? (
              <Badge variant="destructive">{val}</Badge>
            ) : (
              <span className="text-muted-foreground">0</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card className="bg-primary-foreground">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary opacity-70" />
          <CardTitle className="text-base">Performa Per Unit</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="">
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          skeletonRows={4}
          emptyMessage="Belum ada data performa unit."
          enablePagination={false}
          enableSorting={true}
        />
      </CardContent>
    </Card>
  );
}

// ─── Group Summary Tab ────────────────────────────────────────────────────────

function GroupSummaryTab({ period }: { period: AnalyticsPeriod }) {
  const { data, isLoading } = useGroupSummary(period);
  const summary = data?.data;
  const bestUnit = summary?.unit_performance?.[0];

  return (
    <div className="space-y-6">
      <GroupKpiCards data={summary?.kpi} isLoading={isLoading} />
      <SecondaryKpis
        data={summary?.kpi}
        isLoading={isLoading}
        bestUnit={bestUnit}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesTrendChart data={summary?.sales_trend} isLoading={isLoading} />
        </div>
        <div>
          <MenuRevenueList data={summary?.top_menus} isLoading={isLoading} />
        </div>
      </div>
      <TopMenusSection data={summary?.top_menus} isLoading={isLoading} />
      <UnitPerformanceTable
        data={summary?.unit_performance}
        isLoading={isLoading}
      />
    </div>
  );
}

// ─── Per Unit Tab ─────────────────────────────────────────────────────────────

function PerUnitTab({ period }: { period: AnalyticsPeriod }) {
  const unitsQuery = useUnitsQuery(1, 100, false);
  const units = unitsQuery.data?.data ?? [];
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");

  const unitId = selectedUnitId || units[0]?.business_unit_id || "";

  const kpiQuery = useAnalyticsKpi(unitId, period);
  const trendQuery = useAnalyticsSalesTrend(unitId, period);
  const topMenusQuery = useAnalyticsTopMenus(unitId, period);
  const paymentsQuery = useAnalyticsRecentPayments(unitId);
  const inventoryStatusQuery = useAnalyticsInventoryStatus(unitId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-muted-foreground">Pilih Unit:</p>
        <Select value={unitId} onValueChange={setSelectedUnitId}>
          <SelectTrigger className="w-64 bg-primary-foreground">
            <SelectValue placeholder="Pilih unit..." />
          </SelectTrigger>
          <SelectContent className="bg-primary-foreground">
            {units.map((u) => (
              <SelectItem key={u.business_unit_id} value={u.business_unit_id}>
                {u.business_unit_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {unitId ? (
        <>
          {kpiQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-primary">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : kpiQuery.data?.data ? (
            (() => {
              const kpi = kpiQuery.data.data;
              const kpiCards = [
                {
                  title: "Omzet Unit",
                  value: formatRupiah(kpi.total_omzet),
                  icon: TrendingUp,
                },
                {
                  title: "Transaksi",
                  value: formatNumber(kpi.total_transaksi),
                  icon: ShoppingCart,
                },
                {
                  title: "Rata-rata Order",
                  value: formatRupiah(kpi.rata_rata_order),
                  icon: Calculator,
                },
                {
                  title: "Stok Kritis",
                  value: `${kpi.stok_kritis} item`,
                  icon: AlertTriangle,
                },
              ];
              return (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                      <Card key={card.title} className="bg-primary">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-primary-foreground opacity-70">
                              {card.title}
                            </p>
                            <div className="p-2 rounded-lg bg-white/15 shrink-0">
                              <card.icon className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </div>
                          <p className="text-2xl text-primary-foreground font-bold">
                            {card.value}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="bg-primary-foreground">
                      <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Transaksi Selesai
                          </p>
                          <p className="text-lg font-bold">
                            {formatNumber(kpi.selesai)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary-foreground">
                      <CardContent className="p-4 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Dibatalkan
                          </p>
                          <p className="text-lg font-bold">
                            {formatNumber(kpi.dibatalkan)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              );
            })()
          ) : null}
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
          <TopMenusSection
            data={topMenusQuery.data?.data}
            isLoading={topMenusQuery.isLoading}
          />
          <PaymentHistorySection
            data={paymentsQuery.data?.data}
            isLoading={paymentsQuery.isLoading}
          />
          <InventoryStatusSection
            data={inventoryStatusQuery.data?.data}
            isLoading={inventoryStatusQuery.isLoading}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pilih unit untuk melihat laporan.
        </p>
      )}
    </div>
  );
}

// ─── Compare Tab ──────────────────────────────────────────────────────────────

function CompareTab({ period }: { period: AnalyticsPeriod }) {
  const unitsQuery = useUnitsQuery(1, 100, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const units = unitsQuery.data?.data ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const initialized = useRef(false);

  const { data: compareData, isLoading } = useGroupCompare(selectedIds, period);
  const rows: UnitCompareRow[] = compareData?.data ?? [];

  // default all units selected on first load — only runs once when units arrive
  useEffect(() => {
    if (!initialized.current && units.length > 0) {
      initialized.current = true;
      setSelectedIds(units.map((u) => u.business_unit_id));
    }
  }, [units]);

  const toggleUnit = (unitId: string) => {
    setSelectedIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId],
    );
  };

  const omzetChartData = rows.map((r) => ({
    name: r.unit_name,
    Omzet: r.omzet,
  }));

  const transaksiChartData = rows.map((r) => ({
    name: r.unit_name,
    Transaksi: r.transaksi,
    Selesai: r.selesai,
    Dibatalkan: r.dibatalkan,
  }));

  const matriksColumns: ColumnDef<UnitCompareRow, unknown>[] = [
    {
      accessorKey: "unit_name",
      header: "Unit",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("unit_name")}</span>
      ),
    },
    {
      accessorKey: "omzet",
      header: () => <div className="text-left">Omzet</div>,
      cell: ({ row }) => (
        <div className="text-left">{formatRupiah(row.getValue("omzet"))}</div>
      ),
    },
    {
      accessorKey: "transaksi",
      header: () => <div className="text-left">Transaksi</div>,
      cell: ({ row }) => (
        <div className="text-left">
          {formatNumber(row.getValue("transaksi"))}
        </div>
      ),
    },
    {
      accessorKey: "rata_rata_order",
      header: () => <div className="text-left">Rata-rata Order</div>,
      cell: ({ row }) => (
        <div className="text-left">
          {formatRupiah(row.getValue("rata_rata_order"))}
        </div>
      ),
    },
    {
      accessorKey: "selesai",
      header: () => <div className="text-left">Selesai</div>,
      cell: ({ row }) => (
        <div className="text-left text-emerald-400">
          {formatNumber(row.getValue("selesai"))}
        </div>
      ),
    },
    {
      accessorKey: "dibatalkan",
      header: () => <div className="text-left">Batal</div>,
      cell: ({ row }) => (
        <div className="text-left text-red-400">
          {formatNumber(row.getValue("dibatalkan"))}
        </div>
      ),
    },
    {
      accessorKey: "stok_kritis",
      header: () => <div className="text-left">Stok Kritis</div>,
      cell: ({ row }) => {
        const val: number = row.getValue("stok_kritis");
        if (val === 0)
          return (
            <div className="text-left">
              <Badge
                variant="outline"
                className="text-emerald-400 border-emerald-400"
              >
                Aman
              </Badge>
            </div>
          );
        if (val < 3)
          return (
            <div className="text-left">
              <Badge
                variant="outline"
                className="text-amber-400 border-amber-400"
              >
                Rendah {val}
              </Badge>
            </div>
          );
        return (
          <div className="text-left">
            <Badge variant="destructive">Kritis {val}</Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Unit chips */}
      <Card className="bg-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Pilih Unit untuk Dibandingkan
            </CardTitle>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedIds.length} dipilih
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {unitsQuery.isLoading ? (
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {units.map((u) => (
                <button
                  key={u.business_unit_id}
                  onClick={() => toggleUnit(u.business_unit_id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedIds.includes(u.business_unit_id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {u.business_unit_name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedIds.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Pilih minimal 2 unit untuk melihat perbandingan.
        </p>
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="bg-primary-foreground">
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-primary-foreground">
              <CardHeader>
                <CardTitle className="text-base">Omzet per Unit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={omzetChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => formatRupiah(v)}
                      tick={{ fontSize: 11 }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(v) =>
                        v != null
                          ? new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(Number(v))
                          : "-"
                      }
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="Omzet" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-primary-foreground">
              <CardHeader>
                <CardTitle className="text-base">Transaksi per Unit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={transaksiChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="Transaksi"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Selesai"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="Dibatalkan"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Matriks Perbandingan */}
          <Card className="bg-primary-foreground">
            <CardHeader>
              <CardTitle className="text-base">Matriks Perbandingan</CardTitle>
            </CardHeader>
            <CardContent className="">
              <DataTable
                columns={matriksColumns}
                data={rows}
                isLoading={false}
                emptyMessage="Belum ada data perbandingan."
                enablePagination={false}
                enableSorting={true}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GroupAnalyticsReportPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan & Analitik Grup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau performa keseluruhan unit, per unit, dan perbandingan antar
            unit.
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

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="bg-primary-foreground border border-border p-1 h-auto gap-0.5 rounded-full">
          <TabsTrigger
            value="all"
            className="rounded-full px-4 py-1 h-auto flex-none text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none cursor-pointer"
          >
            Semua Unit
          </TabsTrigger>
          <TabsTrigger
            value="per-unit"
            className="rounded-full px-4 py-1 h-auto flex-none text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none cursor-pointer"
          >
            Per Unit
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            className="rounded-full px-4 py-1 h-auto flex-none text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none cursor-pointer"
          >
            Perbandingan
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="all">
            <GroupSummaryTab period={period} />
          </TabsContent>
          <TabsContent value="per-unit">
            <PerUnitTab period={period} />
          </TabsContent>
          <TabsContent value="compare">
            <CompareTab period={period} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
