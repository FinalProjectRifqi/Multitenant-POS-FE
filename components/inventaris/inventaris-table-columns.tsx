"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/inventaris/constant";
import type { InventarisRow } from "@/lib/inventaris/types";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

type Actions = {
  onView: (item: InventarisRow) => void;
  onEdit?: (item: InventarisRow) => void;
  onDelete?: (item: InventarisRow) => void;
};

const STOCK_STATUS_LABEL = {
  low: "Stok Rendah",
  normal: "Stok Normal",
} as const;

export function buildInventarisColumns(
  actions: Actions,
): ColumnDef<InventarisRow, unknown>[] {
  return [
    {
      accessorKey: "inventory_item_name",
      header: "Nama Item",
      cell: ({ row }) => {
        const name: string = row.getValue("inventory_item_name");
        return <span className="font-medium text-foreground">{name}</span>;
      },
    },
    {
      accessorKey: "unit_of_measure",
      header: "Satuan",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("unit_of_measure")}</Badge>
      ),
    },
    {
      id: "stock_status",
      header: "Status Stok",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const isLowStock = item.is_low_stock;
        return (
          <Badge
            variant={isLowStock ? "destructive" : "secondary"}
            className={cn(!isLowStock && "text-emerald-700")}
          >
            {isLowStock ? STOCK_STATUS_LABEL.low : STOCK_STATUS_LABEL.normal}
          </Badge>
        );
      },
    },
    {
      accessorKey: "current_stock",
      header: "Stok Saat Ini",
      cell: ({ row }) => {
        const item = row.original;
        const current = row.getValue<number>("current_stock");
        const max = item.max_threshold;
        const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

        return (
          <div className="flex flex-col gap-1.5 w-40">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={cn(
                  "font-medium tabular-nums",
                  item.is_low_stock ? "text-destructive" : "text-foreground/85",
                )}
              >
                {current}
              </span>
              <span className="text-muted-foreground tabular-nums">
                / {max}
              </span>
            </div>
            <Progress
              value={percentage}
              className={cn(
                "h-1.5",
                item.is_low_stock && "[&>div]:bg-destructive",
              )}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "last_restocked_at",
      header: "Terakhir Restok",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-foreground/85 text-sm">
          {formatDateTime(row.getValue("last_restocked_at"))}
        </span>
      ),
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
                aria-label={`Aksi untuk ${item.inventory_item_name}`}
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
