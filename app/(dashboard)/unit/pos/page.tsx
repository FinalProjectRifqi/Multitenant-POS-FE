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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUS_FILTER_TABS } from "@/lib/orders/constants";
import { useOrderListPage } from "@/lib/orders/use-order-list-page";
import { StatsGrid } from "@/components/shared/stats-grid";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/client copy";
import { PaginationMeta } from "@/lib/schemas/unit";

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

  const statusTabValue = activeStatusId ?? "all";

  return (
    <div className="space-y-5 p-8">
      <section className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Kelola Pesanan
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola semua pesanan dalam sistem Anda
        </p>
      </section>

      {/* ── Stats row ── */}
      {/* <StatsGrid stats={stats} columns={4} /> */}
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
      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Daftar Pesanan
          </CardTitle>
          <CardDescription>
            Kelola semua pesanan dalam sistem Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* {isLoading && (
            <Alert variant="destructive">
              <AlertTitle>Gagal memuat data pengguna</AlertTitle>
              <AlertDescription>
                {getErrorMessage(cancelMutation.error)}
              </AlertDescription>
            </Alert>
          )} */}

          <DataTable
            columns={columns}
            data={orders}
            isLoading={isLoading}
            emptyMessage="Belum ada pesanan."
            actionLabel="Tambah Pesanan"
            onActionClick={() => router.push("/unit/pos/tambah")}
            searchEmptyMessage="Pesanan tidak ditemukan."
            searchColumn="customer_name"
            searchPlaceholder="Cari pelanggan..."
            extraControls={
              <Tabs
                value={statusTabValue}
                onValueChange={(v) =>
                  handleStatusChange(v === "all" ? undefined : v)
                }
              >
                <TabsList className="h-9">
                  {STATUS_FILTER_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.label}
                      value={tab.statusId ?? "all"}
                      className="text-xs data-[state=inactive]:text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-muted data-[state=active]:shadow-sm"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            }
            enablePagination
            meta={paginationMeta}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </CardContent>
      </Card>

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
