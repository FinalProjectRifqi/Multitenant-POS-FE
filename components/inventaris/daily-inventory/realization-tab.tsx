"use client";

import { AlertCircle, CheckCircle2, Info, Loader2, Send } from "lucide-react";

import { RealizationConfirmDialog } from "@/components/inventaris/daily-inventory/realization-confirm-dialog";
import {
  RealizationTable,
  RealizationTotalsBar,
} from "@/components/inventaris/daily-inventory/realization-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DAILY_INVENTORY_CARD_CLASS, formatDailyInventoryDate } from "./shared";
import type { DailyInventorySectionProps } from "./types";
import { useRealizationTab } from "./use-realization-tab";

export function RealizationTab(props: DailyInventorySectionProps) {
  const realization = useRealizationTab(props);

  return (
    <div className="space-y-4">
      {realization.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription>{realization.errorMessage}</AlertDescription>
        </Alert>
      )}

      {!realization.isLoading && !realization.hasPlans && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Belum ada rencana untuk tanggal ini</AlertTitle>
          <AlertDescription>
            Buat rencana penggunaan bahan di tab <strong>Perencanaan</strong>{" "}
            terlebih dahulu, lalu kembali ke tab ini untuk mengisi realisasi.
          </AlertDescription>
        </Alert>
      )}

      {realization.hasPlans && (
        <Card className={DAILY_INVENTORY_CARD_CLASS}>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Realisasi Penggunaan Bahan
                </CardTitle>
                <CardDescription className="mt-1">
                  {formatDailyInventoryDate(props.selectedDate)} -{" "}
                  <span className="text-xs">
                    Variance = Rencana - Aktual - Waste
                  </span>
                </CardDescription>
              </div>

              {!realization.allSubmitted &&
                realization.overUsageRows.length > 0 && (
                  <Badge
                    variant="outline"
                    className="shrink-0 self-start border-destructive/40 text-destructive"
                  >
                    Perlu cek: {realization.overUsageRows.length} bahan melebihi
                    rencana
                  </Badge>
                )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <RealizationTable
              rows={realization.rows}
              isLoading={realization.isLoading}
              allSubmitted={realization.allSubmitted}
              onCopyFromPlan={realization.copyFromPlan}
              onUpdate={realization.updateRow}
            />

            {!realization.isLoading && realization.rows.length > 0 && (
              <RealizationTotalsBar totals={realization.totals} />
            )}

            <div className="flex flex-col gap-3 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
              {realization.allSubmitted ? (
                <p className="flex items-center gap-1.5 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Stok sudah diperbarui dari realisasi ini.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Submit untuk memperbarui stok inventaris.
                </p>
              )}

              <Button
                onClick={() => realization.setIsConfirmOpen(true)}
                disabled={
                  !realization.rows.length ||
                  !realization.pendingRows.length ||
                  realization.hasValidationError ||
                  realization.allSubmitted ||
                  realization.isSubmitting
                }
                className="w-full sm:w-auto"
              >
                {realization.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {realization.pendingRows.length > 0
                  ? `Submit ${realization.pendingRows.length} Realisasi`
                  : "Submit Realisasi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <RealizationConfirmDialog
        open={realization.isConfirmOpen}
        isPending={realization.isSubmitting}
        pendingRowsCount={realization.pendingRows.length}
        totals={realization.totals}
        overUsageRows={realization.overUsageRows}
        onOpenChange={realization.setIsConfirmOpen}
        onSubmit={realization.submitRealization}
      />
    </div>
  );
}
