"use client";

import { useMemo } from "react";
import { ArrowLeft, Banknote, Building2, CreditCard, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";

import { StatsCard } from "@/components/dashboard/ui";
import { buildTransactionHistoryColumns } from "@/components/transactions/transaction-history-table-columns";
import { TransactionHistoryFilters } from "@/components/transactions/transaction-history-filters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/shared/data-table";
import { getErrorMessage } from "@/lib/api/client";
import type { PaginationMeta } from "@/lib/schemas/unit";
import { useTransactionHistoryPage } from "@/lib/transactions/use-transaction-history-page";

type TransactionHistoryPageContentProps = {
  unitId?: string;
  showBackToUnitSelector?: boolean;
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TransactionHistoryPageContent({
  unitId,
  showBackToUnitSelector = false,
}: TransactionHistoryPageContentProps) {
  const router = useRouter();
  const p = useTransactionHistoryPage(unitId);

  const columns = useMemo(() => buildTransactionHistoryColumns(), []);
  const totalRows = p.meta?.total ?? 0;
  const paginationMeta: PaginationMeta = {
    page: p.pagination.pageIndex + 1,
    limit: p.pagination.pageSize,
    total: totalRows,
    totalPages: p.meta?.totalPages ?? Math.ceil(totalRows / p.pagination.pageSize),
  };

  const paidRows = p.transactions.filter((item) => item.payment);
  const cashRows = p.transactions.filter(
    (item) => item.payment?.payment_method === "cash",
  );
  const cashlessRows = p.transactions.filter(
    (item) => item.payment?.payment_method === "cashless",
  );
  const pageRevenue = paidRows.reduce(
    (total, item) => total + (item.payment?.amount ?? item.total_amount),
    0,
  );

  const isHeaderLoading = p.query.isLoading && !p.selectedUnit;

  return (
    <div className="space-y-6 p-8">
      <section className="space-y-3">
        {showBackToUnitSelector && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/group/transaksi")}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pilih Unit
          </Button>
        )}

        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Riwayat Transaksi
          </h1>

          {isHeaderLoading ? (
            <Skeleton className="h-5 w-64 rounded" />
          ) : p.selectedUnit ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>
                {p.selectedUnit.business_unit_name}
                {p.selectedUnit.business_unit_address && (
                  <>
                    <span className="mx-1.5 text-border">|</span>
                    {p.selectedUnit.business_unit_address}
                  </>
                )}
              </span>
            </div>
          ) : (
            <p className="text-sm text-destructive">
              Unit usaha tidak ditemukan atau belum terhubung ke akun ini.
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={ReceiptText}
          label="Total Riwayat"
          value={String(totalRows)}
        />
        <StatsCard
          icon={Banknote}
          label="Pendapatan Halaman"
          value={formatRupiah(pageRevenue)}
        />
        <StatsCard
          icon={Banknote}
          label="Cash"
          value={String(cashRows.length)}
        />
        <StatsCard
          icon={CreditCard}
          label="Cashless"
          value={String(cashlessRows.length)}
        />
      </div>

      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Daftar Transaksi
          </CardTitle>
          <CardDescription>
            Menampilkan transaksi selesai. Filter berdasarkan tanggal, metode
            bayar, dan urutan data.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {p.query.isError && (
            <Alert variant="destructive">
              <AlertTitle>Gagal memuat riwayat transaksi</AlertTitle>
              <AlertDescription>{getErrorMessage(p.query.error)}</AlertDescription>
            </Alert>
          )}

          <TransactionHistoryFilters
            filters={p.filters}
            onChange={p.updateFilters}
            onReset={p.resetFilters}
          />

          <DataTable
            columns={columns}
            data={p.transactions}
            isLoading={p.query.isLoading}
            searchColumn="order_number"
            searchPlaceholder="Cari order, pelanggan, unit, status, pembayaran..."
            emptyMessage="Belum ada riwayat transaksi."
            searchEmptyMessage="Riwayat transaksi tidak ditemukan."
            enableSorting={false}
            enablePagination
            meta={paginationMeta}
            pagination={p.pagination}
            onPaginationChange={p.setPagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
