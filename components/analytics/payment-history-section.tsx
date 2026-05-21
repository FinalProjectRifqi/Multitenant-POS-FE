"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table/data-table";
import type { PaymentHistoryRow } from "@/lib/types/analytics";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const columns: ColumnDef<PaymentHistoryRow, unknown>[] = [
  {
    accessorKey: "reference_number",
    header: "Ref",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-muted-foreground">
        {row.getValue("reference_number") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "order_number",
    header: "Order",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {row.getValue("order_number")}
      </span>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Metode",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        {row.getValue("payment_method")}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-muted-foreground">
        {formatDateTime(row.getValue("created_at"))}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Jumlah</div>,
    cell: ({ row }) => (
      <div className="text-left font-semibold">
        {formatRupiah(row.getValue("amount"))}
      </div>
    ),
  },
];

interface PaymentHistorySectionProps {
  data?: PaymentHistoryRow[];
  isLoading: boolean;
  redirectToTransaksi?: boolean;
  redirectToTransaksiUrl?: string;
  selectedUnitId?: string;
}

export function PaymentHistorySection({
  data = [],
  isLoading,
  redirectToTransaksi = false,
  redirectToTransaksiUrl,
  selectedUnitId,
}: PaymentHistorySectionProps) {
  const router = useRouter();

  return (
    <Card className="bg-primary-foreground">
      <CardHeader className="px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-primary opacity-70" />
            <h3 className="text-lg font-semibold leading-none">
              Riwayat Pembayaran Terbaru
            </h3>
          </div>
          {redirectToTransaksi && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-sm font-semibold text-muted-foreground"
              onClick={() =>
                router.push(
                  redirectToTransaksiUrl || `/group/transaksi/${selectedUnitId}`,
                )
              }
            >
              Lihat Semua
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          skeletonRows={5}
          emptyMessage="Belum ada riwayat pembayaran"
          enablePagination={false}
          enableSorting={false}
        />
      </CardContent>
    </Card>
  );
}
