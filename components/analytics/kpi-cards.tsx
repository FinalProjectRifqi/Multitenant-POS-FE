"use client";

import {
  TrendingUp,
  ShoppingCart,
  Calculator,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsKpiData } from "@/lib/types/analytics";

function formatRupiah(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}rb`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatRupiahFull(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

function GrowthBadge({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return null;
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
        positive
          ? "bg-emerald-500/25 text-emerald-200"
          : "bg-red-500/25 text-red-200"
      }`}
    >
      {positive ? "↑" : "↓"}
      {Math.abs(pct)}%
    </span>
  );
}

interface KpiCardsProps {
  data?: AnalyticsKpiData;
  isLoading: boolean;
  unitName?: string;
}

export function KpiCards({ data, isLoading, unitName }: KpiCardsProps) {
  const selesai = data?.selesai ?? 0;
  const dibatalkan = data?.dibatalkan ?? 0;
  const total = selesai + dibatalkan;
  const batalPct = total > 0 ? Math.round((dibatalkan / total) * 100) : 0;

  const cardBase =
    "relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm";
  const iconWrap =
    "flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 shrink-0";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Total Omzet */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">
            Total Omzet
          </p>
          <div className={iconWrap}>
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="mt-3 h-8 w-28 bg-white/20" />
        ) : (
          <p
            className="mt-2 text-2xl font-bold truncate"
            title={data ? formatRupiahFull(data.total_omzet) : "Rp 0"}
          >
            {data ? formatRupiah(data.total_omzet) : "Rp 0"}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {unitName && (
            <span className="text-xs opacity-60 truncate">{unitName}</span>
          )}
          {!isLoading && <GrowthBadge pct={data?.omzet_growth_pct} />}
        </div>
      </div>

      {/* Total Transaksi */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">
            Total Transaksi
          </p>
          <div className={iconWrap}>
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="mt-3 h-8 w-20 bg-white/20" />
        ) : (
          <p className="mt-2 text-2xl font-bold">
            {data ? formatNumber(data.total_transaksi) : "0"}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {unitName && (
            <span className="text-xs opacity-60 truncate">{unitName}</span>
          )}
          {!isLoading && <GrowthBadge pct={data?.transaksi_growth_pct} />}
        </div>
      </div>

      {/* Rata-rata Order */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">
            Rata-rata Order
          </p>
          <div className={iconWrap}>
            <Calculator className="h-4 w-4" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="mt-3 h-8 w-24 bg-white/20" />
        ) : (
          <p
            className="mt-2 text-2xl font-bold truncate"
            title={data ? formatRupiahFull(data.rata_rata_order) : "Rp 0"}
          >
            {data ? formatRupiah(data.rata_rata_order) : "Rp 0"}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {!isLoading && <GrowthBadge pct={data?.avg_growth_pct} />}
        </div>
      </div>

      {/* Status Transaksi */}
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">
            Status Transaksi
          </p>
          <div className={iconWrap}>
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="mt-3 h-8 w-24 bg-white/20" />
        ) : (
          <>
            <p className="mt-2 text-2xl font-bold">
              {formatNumber(selesai)}{" "}
              <span className="text-base font-normal opacity-60">
                / {formatNumber(dibatalkan)}
              </span>
            </p>
            <p className="mt-2 text-xs opacity-70 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              Selesai /
              <AlertCircle className="h-3 w-3 shrink-0" />
              Dibatalkan
              {dibatalkan > 0 && (
                <span className="ml-1 font-semibold text-red-300">
                  ({batalPct}% batal)
                </span>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
