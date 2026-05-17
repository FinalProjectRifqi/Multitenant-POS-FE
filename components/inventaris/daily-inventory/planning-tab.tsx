"use client";

import { AlertCircle, ClipboardList, Loader2, Save } from "lucide-react";

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
import { usePlanningTab } from "./use-planning-tab";
import { PlanningTable } from "./planning-table";

export function PlanningTab(props: DailyInventorySectionProps) {
  const planning = usePlanningTab(props);

  return (
    <div className="space-y-4">
      {planning.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription>{planning.errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card className={DAILY_INVENTORY_CARD_CLASS}>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">
                Rencana Penggunaan Bahan
              </CardTitle>
              <CardDescription className="mt-1">
                {formatDailyInventoryDate(props.selectedDate)}
              </CardDescription>
            </div>

            {!planning.isLoading && planning.rows.length > 0 && (
              <Badge
                variant="outline"
                className="shrink-0 self-start border-primary/20 bg-primary/5 text-xs font-medium text-primary"
              >
                {planning.plannedCount} / {planning.rows.length} bahan
                direncanakan
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <PlanningTable
            rows={planning.rows}
            isLoading={planning.isLoading}
            onUpdate={planning.updateRow}
          />

          <div className="flex flex-col gap-3 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Tip: bahan dengan angka 0 tidak akan disimpan.
            </p>
            <Button
              onClick={() => void planning.savePlan()}
              disabled={
                !planning.hasValidItems ||
                planning.isLoading ||
                planning.isSaving
              }
              className="w-full sm:w-auto"
            >
              {planning.isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {planning.hasPlan ? "Perbarui Rencana" : "Simpan Rencana"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
