"use client";

import { CheckCircle2, Package } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlanningDraftRow } from "@/lib/inventaris/daily-inventory-utils";
import { cn } from "@/lib/utils";

import {
  DAILY_INVENTORY_TABLE_FRAME_CLASS,
  DAILY_INVENTORY_TABLE_HEADER_ROW_CLASS,
  TableSkeleton,
} from "./shared";
import type { PlanningRowField } from "./types";

type PlanningTableProps = {
  rows: PlanningDraftRow[];
  isLoading: boolean;
  onUpdate: (
    inventoryItemId: string,
    field: PlanningRowField,
    value: string,
  ) => void;
};

export function PlanningTable({
  rows,
  isLoading,
  onUpdate,
}: PlanningTableProps) {
  return (
    <div className={DAILY_INVENTORY_TABLE_FRAME_CLASS}>
      <Table>
        <TableHeader>
          <TableRow className={DAILY_INVENTORY_TABLE_HEADER_ROW_CLASS}>
            <TableHead className="min-w-44">Nama Bahan</TableHead>
            <TableHead className="w-28 text-right">
              <span>Stok Tersedia</span>
              <p className="text-[10px] font-normal text-muted-foreground">
                saat ini
              </p>
            </TableHead>
            <TableHead className="w-20">Satuan</TableHead>
            <TableHead className="w-36">
              <span>Rencana Pakai</span>
              <p className="text-[10px] font-normal text-muted-foreground">
                isi 0 jika tidak dipakai
              </p>
            </TableHead>
            <TableHead className="min-w-40">
              Catatan{" "}
              <span className="font-normal text-muted-foreground">
                (opsional)
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton cols={5} rows={4} />
          ) : rows.length === 0 ? (
            <PlanningEmptyRow />
          ) : (
            rows.map((row) => (
              <PlanningTableRow
                key={row.inventory_item_id}
                row={row}
                onUpdate={onUpdate}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function PlanningTableRow({
  row,
  onUpdate,
}: {
  row: PlanningDraftRow;
  onUpdate: PlanningTableProps["onUpdate"];
}) {
  const isPlanned = row.planned_usage_qty > 0;

  return (
    <TableRow className="transition-colors hover:bg-muted/20">
      <TableCell>
        <div className="flex items-center gap-2">
          {isPlanned ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
          ) : (
            <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/30" />
          )}
          <span className="font-medium">{row.inventory_item_name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        <span
          className={cn(
            "font-semibold",
            row.current_stock === 0 ? "text-red-500" : "text-foreground",
          )}
        >
          {row.current_stock}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {row.unit_of_measure}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          step={1}
          value={row.planned_usage_qty}
          onChange={(event) =>
            onUpdate(
              row.inventory_item_id,
              "planned_usage_qty",
              event.target.value,
            )
          }
          className={cn("h-9 w-28 text-right", isPlanned && "bg-background")}
        />
      </TableCell>
      <TableCell>
        <Input
          value={row.notes}
          onChange={(event) =>
            onUpdate(row.inventory_item_id, "notes", event.target.value)
          }
          placeholder="Misal: untuk menu spesial..."
          className="h-9 w-52 max-w-full"
        />
      </TableCell>
    </TableRow>
  );
}

function PlanningEmptyRow() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="h-36 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="h-9 w-9 opacity-30" />
          <p className="text-sm font-medium">Belum ada bahan inventaris</p>
          <p className="text-xs">
            Tambahkan bahan di halaman <strong>Kelola Inventaris</strong>{" "}
            terlebih dahulu.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
