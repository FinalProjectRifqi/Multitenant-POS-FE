"use client";

import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RealizationDraftRow } from "@/lib/inventaris/daily-inventory-utils";

import type { RealizationTotals } from "./types";

type RealizationConfirmDialogProps = {
  open: boolean;
  isPending: boolean;
  pendingRowsCount: number;
  totals: RealizationTotals;
  overUsageRows: RealizationDraftRow[];
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
};

const CONFIRM_SUMMARY_LABELS: {
  key: keyof Pick<RealizationTotals, "planned" | "actual" | "waste">;
  label: string;
}[] = [
  { key: "planned", label: "Total Rencana" },
  { key: "actual", label: "Total Aktual" },
  { key: "waste", label: "Total Waste" },
];

export function RealizationConfirmDialog({
  open,
  isPending,
  pendingRowsCount,
  totals,
  overUsageRows,
  onOpenChange,
  onSubmit,
}: RealizationConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,520px)] bg-primary-foreground p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Konfirmasi Submit Realisasi
          </DialogTitle>
          <DialogDescription>
            Submit akan <strong>memperbarui stok inventaris</strong>{" "}
            berdasarkan data di bawah. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ringkasan Realisasi
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {CONFIRM_SUMMARY_LABELS.map((summary) => (
              <div
                key={summary.key}
                className="rounded-lg border bg-background p-3 text-center"
              >
                <p className="text-[10px] text-muted-foreground">
                  {summary.label}
                </p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">
                  {totals[summary.key]}
                </p>
              </div>
            ))}
          </div>
          {overUsageRows.length > 0 && (
            <div className="rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive">
              <strong>{overUsageRows.length} bahan melebihi rencana:</strong>{" "}
              {overUsageRows.map((row) => row.inventory_item_name).join(", ")}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Periksa semua angka sebelum melanjutkan.
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal, Cek Ulang
          </Button>
          <Button
            type="button"
            onClick={() => void onSubmit()}
            disabled={isPending || !pendingRowsCount}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ya, Submit & Perbarui Stok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
