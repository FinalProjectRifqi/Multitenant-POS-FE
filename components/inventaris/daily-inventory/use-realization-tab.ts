"use client";

import { useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/lib/api/client";
import {
  buildRealizationDraftRows,
  calculateVariance,
  toNumber,
  type RealizationDraftRow,
} from "@/lib/inventaris/daily-inventory-utils";
import {
  useCreateDailyRealizationsMutation,
  useDailyPlansQuery,
  useDailyRealizationsQuery,
} from "@/lib/queries/daily-inventory";

import type {
  DailyInventorySectionProps,
  RealizationRowField,
  RealizationTotals,
} from "./types";

export function useRealizationTab({
  unitId,
  selectedDate,
}: DailyInventorySectionProps) {
  const [rows, setRows] = useState<RealizationDraftRow[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const plansQuery = useDailyPlansQuery(unitId, selectedDate);
  const realizationsQuery = useDailyRealizationsQuery(unitId, selectedDate);
  const createRealizationsMutation = useCreateDailyRealizationsMutation(unitId);

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const existingRealizations = useMemo(
    () => realizationsQuery.data ?? [],
    [realizationsQuery.data],
  );

  useEffect(() => {
    setRows(buildRealizationDraftRows(plans, existingRealizations));
  }, [plans, existingRealizations]);

  function updateRow(
    inventoryItemId: string,
    field: RealizationRowField,
    value: string,
  ) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.inventory_item_id === inventoryItemId
          ? { ...row, [field]: field === "notes" ? value : toNumber(value) }
          : row,
      ),
    );
  }

  function copyFromPlan(inventoryItemId: string) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.inventory_item_id === inventoryItemId
          ? { ...row, actual_usage_qty: row.planned_usage_qty, waste_qty: 0 }
          : row,
      ),
    );
  }

  const submittedCount = rows.filter(
    (row) => row.existing_status === "SUBMITTED",
  ).length;
  const pendingRows = rows.filter((row) => !row.existing_realization_id);
  const allSubmitted = rows.length > 0 && submittedCount === rows.length;
  const hasValidationError = pendingRows.some(
    (row) => row.actual_usage_qty < 0 || row.waste_qty < 0,
  );

  const totals = useMemo<RealizationTotals>(
    () => ({
      planned: rows.reduce((sum, row) => sum + row.planned_usage_qty, 0),
      actual: rows.reduce((sum, row) => sum + row.actual_usage_qty, 0),
      waste: rows.reduce((sum, row) => sum + row.waste_qty, 0),
      variance: rows.reduce(
        (sum, row) =>
          sum +
          calculateVariance(
            row.planned_usage_qty,
            row.actual_usage_qty,
            row.waste_qty,
          ),
        0,
      ),
    }),
    [rows],
  );

  const overUsageRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          calculateVariance(
            row.planned_usage_qty,
            row.actual_usage_qty,
            row.waste_qty,
          ) < 0,
      ),
    [rows],
  );

  const isLoading = plansQuery.isLoading || realizationsQuery.isLoading;
  const isError = plansQuery.isError || realizationsQuery.isError;

  async function submitRealization() {
    setIsConfirmOpen(false);
    if (!pendingRows.length) return;

    await createRealizationsMutation.createRealizations({
      date: selectedDate,
      items: pendingRows.map((row) => ({
        inventory_item_id: row.inventory_item_id,
        actual_usage_qty: row.actual_usage_qty,
        waste_qty: row.waste_qty,
        ...(row.remaining_qty > 0 ? { remaining_qty: row.remaining_qty } : {}),
        ...(row.notes ? { notes: row.notes } : {}),
      })),
    });
  }

  return {
    allSubmitted,
    copyFromPlan,
    errorMessage: isError
      ? getErrorMessage(plansQuery.error ?? realizationsQuery.error ?? undefined)
      : null,
    hasPlans: plans.length > 0,
    hasValidationError,
    isConfirmOpen,
    isError,
    isLoading,
    isSubmitting: createRealizationsMutation.isPending,
    overUsageRows,
    pendingRows,
    rows,
    setIsConfirmOpen,
    submitRealization,
    totals,
    updateRow,
  };
}
