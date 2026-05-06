"use client";

import {
  ClipboardList,
  Plus,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { buildOrderColumns } from "@/components/orders/order-table-columns";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { PageHeader, StatsCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { STATUS_FILTER_TABS } from "@/lib/orders/constants";
import { useOrderListPage } from "@/lib/orders/use-order-list-page";
import { cn } from "@/lib/utils";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function KelolaPesananPage() {
  const router = useRouter();
  const {
    orders,
    totalRows,
    isLoading,
    stats,
    pagination,
    setPagination,
    activeStatusId,
    handleStatusChange,
    deletingOrder,
    setDeletingOrder,
    cancelMutation,
    handleCancelConfirm,
  } = useOrderListPage();

  const columns = useMemo(
    () => buildOrderColumns(setDeletingOrder),
    [setDeletingOrder],
  );

  const paginationMeta = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    total: totalRows,
    totalPages: Math.ceil(totalRows / pagination.pageSize),
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Kelola Pesanan"
        description="Pantau dan kelola semua pesanan aktif restoran Anda"
      >
        <Button
          onClick={() => router.push("/unit/pos/tambah")}
          className="cursor-pointer hover:backdrop-brightness-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pesanan
        </Button>
      </PageHeader>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={ClipboardList}
          label="Total Pesanan"
          value={String(stats.total)}
        />
        <StatsCard
          icon={ShoppingCart}
          label="Pesanan Aktif"
          value={String(stats.active)}
        />
        <StatsCard
          icon={ShoppingBag}
          label="Pesanan Selesai"
          value={String(stats.completed)}
        />
        <StatsCard
          icon={TrendingUp}
          label="Pendapatan"
          value={formatRupiah(stats.revenue)}
        />
      </div>

      {/* ── Status filter tabs ── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              activeStatusId === tab.statusId
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50",
            )}
            onClick={() => handleStatusChange(tab.statusId)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Orders table ── */}
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyMessage="Belum ada pesanan."
        searchEmptyMessage="Pesanan tidak ditemukan."
        enablePagination
        meta={paginationMeta}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      {/* ── Cancel confirmation dialog ── */}
      <ConfirmDeleteDialog
        open={Boolean(deletingOrder)}
        onOpenChange={(open) => {
          if (!open) setDeletingOrder(null);
        }}
        title="Hapus Pesanan"
        description={
          deletingOrder ? (
            <>
              Hapus pesanan <strong>{deletingOrder.order_number}</strong> dari{" "}
              <strong>{deletingOrder.customer_name}</strong>? Tindakan ini tidak
              dapat dibatalkan.
            </>
          ) : (
            "Hapus pesanan ini?"
          )
        }
        isPending={cancelMutation.isPending}
        errorMessage={cancelMutation.error}
        onConfirm={handleCancelConfirm}
        confirmLabel="Hapus"
      />
    </div>
  );
}
