"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  KdsFilterTabs,
  KdsOrderCard,
  KdsOrderDetailDialog,
} from "@/components/kitchen";
import { StatsGrid } from "@/components/shared/stats-grid";
import { getErrorMessage } from "@/lib/api/client";
import { KDS_FILTER_TABS } from "@/lib/kitchen-display/constants";
import { useKitchenDisplayPage } from "@/lib/kitchen-display/use-kitchen-display-page";
import { RefreshCw } from "lucide-react";

const STATUS_COLUMN_CLASS: Record<1 | 2 | 3 | 4, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function getOrderSortTimestamp(order: { updated_at?: string; ordered_at: string }) {
  const source = order.updated_at ?? order.ordered_at;
  const time = new Date(source).getTime();
  return Number.isNaN(time) ? 0 : time;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function KdsCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

function KdsColumnSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-[#D8CEC1] bg-[#EAE4DB] p-3">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        <KdsCardSkeleton />
        <KdsCardSkeleton />
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function KdsEmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">🍽️</div>
      <p className="text-base font-semibold text-foreground">
        {hasFilter
          ? "Tidak ada pesanan dengan status ini"
          : "Belum ada pesanan masuk"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilter
          ? "Pilih filter lain atau tunggu pesanan baru masuk."
          : "Dapur sedang menunggu pesanan dari pelanggan."}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KitchenDisplayPage() {
  const p = useKitchenDisplayPage();

  const isLoadingInitial = p.query.isLoading;
  const isRefetching = p.query.isFetching && !p.query.isLoading;
  const statusColumns = KDS_FILTER_TABS.filter((tab) => tab.value !== "all");
  const visibleColumns =
    p.activeFilter === "all"
      ? statusColumns
      : statusColumns.filter((tab) => tab.value === p.activeFilter);
  const boardColumns = Math.min(Math.max(visibleColumns.length, 1), 4) as
    | 1
    | 2
    | 3
    | 4;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── Page heading ── */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Kitchen Display System {p.unitName}
          </h1>
          {/* Subtle spinning indicator while background refetch is happening */}
          {isRefetching && (
            <RefreshCw
              className="h-5 w-5 animate-spin text-muted-foreground"
              aria-label="Memperbarui data…"
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Pantau dan kelola pesanan dapur secara real-time · Diperbarui setiap
          25 detik
        </p>
      </section>

      {/* ── Error banner ── */}
      {p.query.isError && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat data pesanan</AlertTitle>
          <AlertDescription>{getErrorMessage(p.query.error)}</AlertDescription>
        </Alert>
      )}

      {/* ── Stat cards ── */}
      <StatsGrid stats={p.stats} columns={4} />

      {/* ── Filter tabs ── */}
      <KdsFilterTabs
        active={p.activeFilter}
        counts={p.filterCounts}
        onChange={p.setActiveFilter}
      />

      {/* ── status board ── */}
      <div
        className={`grid grid-cols-1 gap-4 ${STATUS_COLUMN_CLASS[boardColumns]}`}
      >
        {isLoadingInitial ? (
          Array.from({ length: 3 }).map((_, i) => <KdsColumnSkeleton key={i} />)
        ) : p.filteredOrders.length === 0 ? (
          <KdsEmptyState hasFilter={p.activeFilter !== "all"} />
        ) : (
          visibleColumns.map((column) => {
            const columnOrders = p.orders
              .filter((order) => order.order_status_id === column.value)
              .sort(
                (a, b) => getOrderSortTimestamp(b) - getOrderSortTimestamp(a),
              );

            return (
              <section
                key={column.value}
                className="w-full rounded-2xl border border-[#D8CEC1] bg-[#EAE4DB] px-3 pb-3 lg:max-h-[calc(100dvh-19rem)] lg:overflow-hidden"
              >
                <header className="-mx-3 mb-3 flex items-center justify-between border-b border-[#D8CEC1] bg-[#EAE4DB] px-3 py-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {column.label}
                  </h3>
                  <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-background/95 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {columnOrders.length}
                  </span>
                </header>

                {columnOrders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/70 px-3 py-5 text-center text-xs text-muted-foreground">
                    Belum ada order di status ini.
                  </div>
                ) : (
                  <div className="space-y-3 lg:max-h-[calc(100dvh-24rem)] lg:overflow-y-auto lg:pr-1">
                    {columnOrders.map((order) => (
                      <KdsOrderCard
                        key={order.order_id}
                        unitId={p.unitId}
                        order={order}
                        onCardClick={p.openOrderDetail}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* ── Order detail dialog ── */}
      <KdsOrderDetailDialog
        order={p.selectedOrder}
        unitName={p.unitName}
        open={Boolean(p.selectedOrder)}
        onOpenChange={(open) => {
          if (!open) p.closeOrderDetail();
        }}
      />
    </div>
  );
}
