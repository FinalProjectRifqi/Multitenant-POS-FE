"use client";

// components/orders/order-table-columns.tsx

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ORDER_STATUS } from "@/lib/orders/constants";
import type { OrderListItem } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

// ─── Formatter ─────────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Actions column component ─────────────────────────────────────────────────

function OrderActions({
  order,
  onDelete,
  onOpenPayment,
}: {
  order: OrderListItem;
  onDelete: (order: OrderListItem) => void;
  onOpenPayment: (order: OrderListItem) => void;
}) {
  const router = useRouter();
  const canUpdate =
    order.order_status_id !== ORDER_STATUS.COMPLETE &&
    order.order_status_id !== ORDER_STATUS.CANCEL;
  const canCancel = order.order_status_id === ORDER_STATUS.JUST_IN;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Aksi</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onOpenPayment(order)}>
          Detail & Bayar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn(!canUpdate && "opacity-40 cursor-not-allowed")}
          onSelect={() => {
            if (!canUpdate) return;
            router.push(`/unit/pos/edit/${order.order_id}`);
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "text-destructive focus:text-destructive",
            !canCancel && "opacity-40 cursor-not-allowed",
          )}
          onSelect={() => {
            if (!canCancel) return;
            onDelete(order);
          }}
        >
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Column definitions ────────────────────────────────────────────────────────

export function buildOrderColumns(
  onDelete: (order: OrderListItem) => void,
  onOpenPayment: (order: OrderListItem) => void,
): ColumnDef<OrderListItem, unknown>[] {
  return [
    {
      accessorKey: "order_number",
      header: "No. Pesanan",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">
          {row.original.order_number}
        </span>
      ),
    },
    {
      accessorKey: "customer_name",
      header: "Pelanggan",
      cell: ({ row }) => {
        const name = row.original.customer_name;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {getInitials(name)}
            </div>
            <span className="text-sm">{name}</span>
          </div>
        );
      },
    },
    {
      id: "table_type",
      header: "Meja / Tipe",
      cell: ({ row }) => {
        const { table_number, order_type_name } = row.original;
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <UtensilsCrossed className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>
              {table_number ? `Meja ${table_number}` : order_type_name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatRupiah(row.original.total_amount)}
        </span>
      ),
    },
    {
      accessorKey: "order_status_id",
      header: "Status",
      cell: ({ row }) => (
        <OrderStatusBadge
          statusId={row.original.order_status_id}
          statusName={row.original.order_status_name}
        />
      ),
    },
    {
      accessorKey: "ordered_at",
      header: "Waktu",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatTime(row.original.ordered_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <OrderActions
          order={row.original}
          onDelete={onDelete}
          onOpenPayment={onOpenPayment}
        />
      ),
    },
  ];
}
