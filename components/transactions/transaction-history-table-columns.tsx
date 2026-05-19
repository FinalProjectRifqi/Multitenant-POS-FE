"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Banknote, CreditCard, ReceiptText, UtensilsCrossed } from "lucide-react";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Badge } from "@/components/ui/badge";
import type { TransactionHistoryItem } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentBadge({ transaction }: { transaction: TransactionHistoryItem }) {
  const payment = transaction.payment;

  if (!payment) {
    return (
      <Badge variant="outline" className="border-zinc-200 bg-zinc-100 text-zinc-600">
        Belum bayar
      </Badge>
    );
  }

  const isCashless = payment.payment_method === "cashless";
  const Icon = isCashless ? CreditCard : Banknote;

  return (
    <div className="space-y-1">
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 border",
          isCashless
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700",
        )}
      >
        <Icon className="size-3" />
        {isCashless ? "Cashless" : "Cash"}
      </Badge>
      <p className="max-w-40 truncate text-xs text-muted-foreground">
        {payment.reference_number}
      </p>
    </div>
  );
}

export function buildTransactionHistoryColumns(): ColumnDef<
  TransactionHistoryItem,
  unknown
>[] {
  return [
    {
      accessorKey: "order_number",
      header: "No. Order",
      filterFn: (row, _columnId, filterValue: string) => {
        const item = row.original;
        const query = filterValue.toLowerCase();
        return [
          item.order_number,
          item.customer_name,
          item.business_unit_name ?? "",
          item.order_type_name,
          item.order_status_name,
          item.payment?.reference_number ?? "",
          item.payment?.payment_status ?? "",
          item.payment?.payment_method ?? "",
        ].some((field) => field.toLowerCase().includes(query));
      },
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ReceiptText className="size-4 text-muted-foreground" />
            {row.original.order_number}
          </div>
          <p className="text-xs text-muted-foreground">
            {row.original.business_unit_name ?? "Unit tidak diketahui"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: "Pelanggan",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{row.original.customer_name}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UtensilsCrossed className="size-3.5" />
            <span>
              {row.original.table_number
                ? `Meja ${row.original.table_number}`
                : row.original.order_type_name}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-foreground">
          {formatRupiah(row.original.total_amount)}
        </span>
      ),
    },
    {
      accessorKey: "order_status_id",
      header: "Status Order",
      cell: ({ row }) => (
        <OrderStatusBadge
          statusId={row.original.order_status_id}
          statusName={row.original.order_status_name}
        />
      ),
    },
    {
      id: "payment",
      header: "Pembayaran",
      enableSorting: false,
      cell: ({ row }) => <PaymentBadge transaction={row.original} />,
    },
    {
      accessorKey: "ordered_at",
      header: "Dipesan",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.ordered_at)}
        </span>
      ),
    },
    {
      accessorKey: "completed_at",
      header: "Selesai",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.completed_at)}
        </span>
      ),
    },
  ];
}
