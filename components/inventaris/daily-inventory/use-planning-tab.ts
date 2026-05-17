"use client";

import { useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "@/lib/api/client";
import {
  buildPlanningDraftRows,
  toNumber,
  type PlanningDraftRow,
} from "@/lib/inventaris/daily-inventory-utils";
import {
  useCreateDailyPlansMutation,
  useDailyPlansQuery,
  useUpdateDailyPlanItemMutation,
} from "@/lib/queries/daily-inventory";
import { useInventarisItemsQuery } from "@/lib/queries/inventaris";

import { INVENTORY_LIST_LIMIT } from "./shared";
import type { DailyInventorySectionProps, PlanningRowField } from "./types";

export function usePlanningTab({
  unitId,
  selectedDate,
}: DailyInventorySectionProps) {
  const [rows, setRows] = useState<PlanningDraftRow[]>([]);

  const itemsQuery = useInventarisItemsQuery(unitId, {
    limit: INVENTORY_LIST_LIMIT,
  });
  const plansQuery = useDailyPlansQuery(unitId, selectedDate);
  const createPlansMutation = useCreateDailyPlansMutation(unitId);
  const updatePlanMutation = useUpdateDailyPlanItemMutation(unitId);

  const items = useMemo(
    () => itemsQuery.data?.data ?? [],
    [itemsQuery.data?.data],
  );
  const existingPlans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);

  useEffect(() => {
    setRows(buildPlanningDraftRows(items, existingPlans));
  }, [items, existingPlans]);

  function updateRow(
    inventoryItemId: string,
    field: PlanningRowField,
    value: string,
  ) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.inventory_item_id === inventoryItemId
          ? {
              ...row,
              [field]: field === "planned_usage_qty" ? toNumber(value) : value,
            }
          : row,
      ),
    );
  }

  async function savePlan() {
    const rowsToSave = rows.filter((row) => row.planned_usage_qty > 0);
    if (!rowsToSave.length) return;

    const existingRows = rowsToSave.filter((row) => row.existing_plan_id);
    const newRows = rowsToSave.filter((row) => !row.existing_plan_id);

    await Promise.all(
      existingRows.map((row) =>
        updatePlanMutation.updatePlanItem({
          planId: row.existing_plan_id!,
          date: selectedDate,
          payload: {
            planned_usage_qty: row.planned_usage_qty,
            ...(row.notes ? { notes: row.notes } : {}),
          },
        }),
      ),
    );

    if (newRows.length > 0) {
      await createPlansMutation.createPlans({
        date: selectedDate,
        items: newRows.map((row) => ({
          inventory_item_id: row.inventory_item_id,
          planned_usage_qty: row.planned_usage_qty,
          unit: row.unit_of_measure,
          ...(row.notes ? { notes: row.notes } : {}),
        })),
      });
    }
  }

  const isLoading = itemsQuery.isLoading || plansQuery.isLoading;
  const isError = itemsQuery.isError || plansQuery.isError;
  const plannedCount = rows.filter((row) => row.planned_usage_qty > 0).length;
  const hasPlan = existingPlans.length > 0;
  const hasValidItems = plannedCount > 0;
  const isSaving =
    createPlansMutation.isPending || updatePlanMutation.isPending;

  return {
    errorMessage: isError
      ? getErrorMessage(itemsQuery.error ?? plansQuery.error ?? undefined)
      : null,
    hasPlan,
    hasValidItems,
    isError,
    isLoading,
    isSaving,
    plannedCount,
    rows,
    savePlan,
    updateRow,
  };
}
