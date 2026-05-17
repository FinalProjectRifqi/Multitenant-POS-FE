"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Loader2, MinusCircle } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/menu/constants";
import type { MenuRow } from "@/lib/menu/types";
import { cn } from "@/lib/utils";

type ToggleActions = {
  onAvailabilityChange: (item: MenuRow, nextIsAvailable: boolean) => void;
  togglingId: string | null;
};

function AvailabilityStatus({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        isAvailable
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-zinc-200 bg-zinc-100 text-zinc-600",
      )}
    >
      {isAvailable ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <MinusCircle className="size-3.5" />
      )}
      {isAvailable ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function AvailabilityToggle({
  item,
  isToggling,
  onAvailabilityChange,
}: {
  item: MenuRow;
  isToggling: boolean;
  onAvailabilityChange: (item: MenuRow, nextIsAvailable: boolean) => void;
}) {
  const isAvailable = item.is_available;

  return (
    <div className="flex min-w-56 items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {isAvailable ? "Menu Tersedia" : "Menu Tidak Tersedia"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isAvailable
            ? "Matikan jika stok habis"
            : "Aktifkan jika siap dipesan"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isToggling && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        <Switch
          checked={isAvailable}
          disabled={isToggling}
          aria-label={
            isAvailable
              ? `Nonaktifkan ${item.menu_name}`
              : `Aktifkan ${item.menu_name}`
          }
          onCheckedChange={(checked) => onAvailabilityChange(item, checked)}
        />
      </div>
    </div>
  );
}

export function buildMenuToggleColumns(
  actions: ToggleActions,
): ColumnDef<MenuRow, unknown>[] {
  return [
    {
      accessorKey: "menu_name",
      header: "Nama Menu",
      filterFn: (row, _colId, filterValue: string) => {
        const item = row.original;
        const query = filterValue.toLowerCase();
        return [
          item.menu_name,
          item.menu_category_name,
          formatCurrency(item.menu_price),
        ].some((field) => field.toLowerCase().includes(query));
      },
      cell: ({ row }) => (
        <div className="min-w-64">
          <span className="font-medium text-foreground">
            {row.getValue("menu_name")}
          </span>
          {!row.original.is_available && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tidak muncul di halaman order
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "menu_category_name",
      header: "Kategori",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-foreground/70">
          {row.getValue("menu_category_name")}
        </span>
      ),
    },
    {
      accessorKey: "menu_price",
      header: "Harga",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-foreground/70">
          {formatCurrency(row.getValue("menu_price"))}
        </span>
      ),
    },
    {
      accessorKey: "is_available",
      header: "Status Saat Ini",
      enableSorting: false,
      cell: ({ row }) => (
        <AvailabilityStatus isAvailable={row.original.is_available} />
      ),
    },
    {
      id: "toggle_availability",
      header: "Ubah Ketersediaan",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <AvailabilityToggle
            item={item}
            isToggling={actions.togglingId === item.menu_id}
            onAvailabilityChange={actions.onAvailabilityChange}
          />
        );
      },
    },
  ];
}
