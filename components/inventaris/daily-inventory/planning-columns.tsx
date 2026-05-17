"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { PlanningDraftRow } from "@/lib/inventaris/daily-inventory-utils";
import { cn } from "@/lib/utils";

import type { PlanningRowField } from "./types";

type PlanningColumnActions = {
  onUpdate: (
    inventoryItemId: string,
    field: PlanningRowField,
    value: string,
  ) => void;
};

export function buildPlanningColumns({
  onUpdate,
}: PlanningColumnActions): ColumnDef<PlanningDraftRow, unknown>[] {
  return [
    {
      accessorKey: "inventory_item_name",
      header: "Nama Bahan",
      cell: ({ row }) => {
        const item = row.original;
        const isPlanned = item.planned_usage_qty > 0;

        return (
          <div className="flex min-w-44 items-center gap-2">
            {isPlanned ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            ) : (
              <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/30" />
            )}
            <span className="font-medium">{item.inventory_item_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "current_stock",
      header: () => (
        <div>
          <span>Stok Tersedia</span>
          <p className="text-[10px] font-normal text-muted-foreground">
            saat ini
          </p>
        </div>
      ),
      cell: ({ row }) => {
        const stock = row.original.current_stock;

        return (
          <span
            className={cn(
              "block min-w-20 text-right font-semibold tabular-nums",
              stock === 0 ? "text-red-500" : "text-foreground",
            )}
          >
            {stock}
          </span>
        );
      },
    },
    {
      accessorKey: "unit_of_measure",
      header: "Satuan",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.unit_of_measure}
        </span>
      ),
    },
    {
      accessorKey: "planned_usage_qty",
      header: () => (
        <div>
          <span>Rencana Pakai</span>
          <p className="text-[10px] font-normal text-muted-foreground">
            isi 0 jika tidak dipakai
          </p>
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isPlanned = item.planned_usage_qty > 0;

        return (
          <Input
            type="number"
            min={0}
            step={1}
            value={item.planned_usage_qty}
            onChange={(event) =>
              onUpdate(
                item.inventory_item_id,
                "planned_usage_qty",
                event.target.value,
              )
            }
            className={cn("h-9 w-28 text-right", isPlanned && "bg-background")}
          />
        );
      },
    },
    {
      accessorKey: "notes",
      header: () => (
        <span>
          Catatan{" "}
          <span className="font-normal text-muted-foreground">(opsional)</span>
        </span>
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <Input
            value={item.notes}
            onChange={(event) =>
              onUpdate(item.inventory_item_id, "notes", event.target.value)
            }
            placeholder="Misal: untuk menu spesial..."
            className="h-9 w-52 max-w-full"
          />
        );
      },
    },
  ];
}
