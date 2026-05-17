"use client";

import { RealizationStatusBadge } from "@/components/inventaris/realization-status-badge";
import { VarianceBadge } from "@/components/inventaris/variance-badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateVariance,
  type RealizationDraftRow,
} from "@/lib/inventaris/daily-inventory-utils";
import { cn } from "@/lib/utils";

import {
  DAILY_INVENTORY_TABLE_FRAME_CLASS,
  DAILY_INVENTORY_TABLE_HEADER_ROW_CLASS,
  TableSkeleton,
} from "./shared";
import type { RealizationRowField, RealizationTotals } from "./types";

type RealizationTableProps = {
  rows: RealizationDraftRow[];
  isLoading: boolean;
  allSubmitted: boolean;
  onCopyFromPlan: (inventoryItemId: string) => void;
  onUpdate: (
    inventoryItemId: string,
    field: RealizationRowField,
    value: string,
  ) => void;
};

export function RealizationTable({
  rows,
  isLoading,
  allSubmitted,
  onCopyFromPlan,
  onUpdate,
}: RealizationTableProps) {
  return (
    <div className={DAILY_INVENTORY_TABLE_FRAME_CLASS}>
      <Table>
        <TableHeader>
          <TableRow className={DAILY_INVENTORY_TABLE_HEADER_ROW_CLASS}>
            <TableHead className="min-w-44">Nama Bahan</TableHead>
            <TableHead className="w-20">Satuan</TableHead>
            <TableHead className="w-24 text-right">Rencana</TableHead>
            <TableHead className="w-48">
              <span>Aktual Pakai</span>
              <p className="text-[10px] font-normal text-muted-foreground">
                jumlah yang benar-benar digunakan
              </p>
            </TableHead>
            <TableHead className="w-36">
              <span>Terbuang (Waste)</span>
              <p className="text-[10px] font-normal text-muted-foreground">
                default 0
              </p>
            </TableHead>
            <TableHead className="w-28 text-center">Variance</TableHead>
            <TableHead className="w-32">Status</TableHead>
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
            <TableSkeleton cols={8} rows={3} />
          ) : (
            rows.map((row) => (
              <RealizationTableRow
                key={row.inventory_item_id}
                row={row}
                allSubmitted={allSubmitted}
                onCopyFromPlan={onCopyFromPlan}
                onUpdate={onUpdate}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function RealizationTotalsBar({ totals }: { totals: RealizationTotals }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-2.5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ringkasan:
      </span>
      <span>
        Rencana: <strong className="tabular-nums">{totals.planned}</strong>
      </span>
      <span>
        Aktual: <strong className="tabular-nums">{totals.actual}</strong>
      </span>
      <span>
        Waste: <strong className="tabular-nums">{totals.waste}</strong>
      </span>
      <span className="flex items-center gap-1.5">
        Total Variance: <VarianceBadge variance={totals.variance} />
      </span>
    </div>
  );
}

function RealizationTableRow({
  row,
  allSubmitted,
  onCopyFromPlan,
  onUpdate,
}: {
  row: RealizationDraftRow;
  allSubmitted: boolean;
  onCopyFromPlan: RealizationTableProps["onCopyFromPlan"];
  onUpdate: RealizationTableProps["onUpdate"];
}) {
  const variance = calculateVariance(
    row.planned_usage_qty,
    row.actual_usage_qty,
    row.waste_qty,
  );
  const isRowSubmitted = row.existing_status === "SUBMITTED";
  const isLocked = isRowSubmitted || allSubmitted;
  const rowStatus = isRowSubmitted
    ? "SUBMITTED"
    : row.existing_status === "DRAFT"
      ? "DRAFT"
      : "PLANNED";

  return (
    <TableRow
      className={cn(
        "transition-colors",
        isLocked && "opacity-70",
        !isLocked && "hover:bg-muted/20",
      )}
    >
      <TableCell className="font-medium">{row.inventory_item_name}</TableCell>
      <TableCell className="text-muted-foreground">{row.unit}</TableCell>
      <TableCell className="text-right tabular-nums font-semibold">
        {row.planned_usage_qty}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            step={1}
            value={row.actual_usage_qty}
            disabled={isLocked}
            onChange={(event) =>
              onUpdate(
                row.inventory_item_id,
                "actual_usage_qty",
                event.target.value,
              )
            }
            className="h-9 w-20 text-right disabled:opacity-60"
          />
          {!isLocked && (
            <button
              type="button"
              onClick={() => onCopyFromPlan(row.inventory_item_id)}
              title="Salin nilai dari Rencana"
              className="whitespace-nowrap rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              = Rencana
            </button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          step={1}
          value={row.waste_qty}
          disabled={isLocked}
          onChange={(event) =>
            onUpdate(row.inventory_item_id, "waste_qty", event.target.value)
          }
          className="h-9 w-20 text-right disabled:opacity-60"
        />
      </TableCell>
      <TableCell className="text-center">
        <VarianceBadge variance={variance} />
      </TableCell>
      <TableCell>
        <RealizationStatusBadge status={rowStatus} />
      </TableCell>
      <TableCell>
        <Input
          value={row.notes}
          disabled={isLocked}
          onChange={(event) =>
            onUpdate(row.inventory_item_id, "notes", event.target.value)
          }
          placeholder="Catatan..."
          className="h-9 w-44 max-w-full disabled:opacity-60"
        />
      </TableCell>
    </TableRow>
  );
}
