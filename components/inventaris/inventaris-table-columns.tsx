"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { InventarisRow } from "@/lib/inventaris/types";

type Actions = {
  onView: (item: InventarisRow) => void;
  onEdit?: (item: InventarisRow) => void;
  onDelete?: (item: InventarisRow) => void;
};

export function buildInventarisColumns(
  actions: Actions,
): ColumnDef<InventarisRow, unknown>[] {
  return [
    {
      accessorKey: "item_name",
      header: "Nama Barang",
      filterFn: (row, _colId, filterValue: string) => {
        const item = row.original;
        const query = filterValue.toLowerCase();

        return [
          item.item_name,
          item.unit_of_measurement,
          String(item.current_stock),
        ].some((field) => field.toLowerCase().includes(query));
      },
      cell: ({ row }) => {
        const name: string = row.getValue("item_name");
        const initials = name
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("");

        return (
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </span>
            <span className="font-medium text-foreground">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "unit_of_measurement",
      header: "Satuan",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {row.getValue("unit_of_measurement")}
        </span>
      ),
    },
    {
      accessorKey: "current_stock",
      header: "Stok Saat Ini",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span
            className={cn(
              "font-medium",
              item.is_low_stock ? "text-destructive" : "text-foreground/85",
            )}
          >
            {row.getValue<number>("current_stock")}
          </span>
        );
      },
    },
    {
      accessorKey: "min_stock",
      header: "Batas Minimum",
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {row.getValue<number>("min_stock")}
        </span>
      ),
    },
    {
      accessorKey: "max_stock",
      header: "Batas Maksimum",
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {row.getValue<number>("max_stock")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const isLow = row.original.is_low_stock;
        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              isLow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
            )}
          >
            {isLow ? "Menipis" : "Tersedia"}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Aksi untuk ${item.item_name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem
                onSelect={() => {
                  actions.onView(item);
                }}
              >
                Lihat Detail
              </DropdownMenuItem>
              {actions.onEdit && (
                <DropdownMenuItem
                  onSelect={() => {
                    actions.onEdit!(item);
                  }}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {actions.onDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => {
                    actions.onDelete!(item);
                  }}
                >
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
