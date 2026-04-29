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
import { useKitchenDisplayPage } from "@/lib/kitchen-display/use-kitchen-display-page";
import type { KdsStatus } from "@/lib/schemas/order";
import { RefreshCw } from "lucide-react";

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

// ── Empty state ────────────────────────────────────────────────────────────────

function KdsEmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
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

  return (
    <div className="space-y-6 p-8">
      {/* ── Page heading ── */}
      <section className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
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
      <StatsGrid stats={p.stats} columns={3} />

      {/* ── Filter tabs ── */}
      <KdsFilterTabs
        active={p.activeFilter}
        counts={p.filterCounts}
        onChange={p.setActiveFilter}
      />

      {/* ── Order card grid ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingInitial ? (
          // Show skeleton placeholders during the very first load
          Array.from({ length: 6 }).map((_, i) => <KdsCardSkeleton key={i} />)
        ) : p.filteredOrders.length === 0 ? (
          <KdsEmptyState hasFilter={p.activeFilter !== "all"} />
        ) : (
          p.filteredOrders.map((order) => (
            <KdsOrderCard
              key={order.order_id}
              order={order}
              isPending={
                p.updateIsPending && p.pendingOrderId === order.order_id
              }
              onActionClick={(order, nextStatus: KdsStatus) =>
                p.handleAdvanceStatus(order, nextStatus)
              }
              onCardClick={p.openOrderDetail}
            />
          ))
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
        isPending={
          p.updateIsPending &&
          p.pendingOrderId === p.selectedOrder?.order_id
        }
        onActionClick={(order, nextStatus: KdsStatus) =>
          p.handleAdvanceStatus(order, nextStatus)
        }
      />
    </div>
  );
}
