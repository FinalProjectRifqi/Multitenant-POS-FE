"use client";

import { useMemo, useState } from "react";

import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useUnitsQuery,
  useUpdateUnitMutation,
} from "@/lib/queries/unit";
import type { CreateUnitRequest, UnitEntity } from "@/lib/schemas/unit";
import { DEFAULT_UNIT_FORM_VALUES } from "./constants";
import { buildUnitStats } from "./stats";

export function useUnitPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitEntity | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<UnitEntity | null>(null);

  const unitsQuery = useUnitsQuery();
  const createMutation = useCreateUnitMutation();
  const updateMutation = useUpdateUnitMutation();
  const deleteMutation = useDeleteUnitMutation();

  const units = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data]);
  const stats = useMemo(() => buildUnitStats(units), [units]);

  const editInitialValues = useMemo<CreateUnitRequest>(() => {
    if (!editingUnit) return DEFAULT_UNIT_FORM_VALUES;
    const { unit_name, unit_address, phone_number, status } = editingUnit;
    return { unit_name, unit_address, phone_number, status };
  }, [editingUnit]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleCreate(values: CreateUnitRequest) {
    await createMutation.createUnit(values);
    setIsCreateOpen(false);
  }

  async function handleUpdate(values: CreateUnitRequest) {
    if (!editingUnit) return;
    await updateMutation.updateUnit({
      unit_id: editingUnit.unit_id,
      payload: values,
    });
    setEditingUnit(null);
  }

  async function handleDelete() {
    if (!deletingUnit) return;
    await deleteMutation.deleteUnit({ unit_id: deletingUnit.unit_id });
    setDeletingUnit(null);
  }

  return {
    // Raw data — pass the full list to DataTable; TanStack filters internally
    units,
    stats,
    editInitialValues,

    // Query meta
    query: {
      isLoading: unitsQuery.isLoading,
      isError: unitsQuery.isError,
      error: unitsQuery.error,
    },

    // Dialog state
    isCreateOpen,
    setIsCreateOpen,
    editingUnit,
    setEditingUnit,
    deletingUnit,
    setDeletingUnit,

    // Mutations — grouped so page.tsx destructures cleanly
    create: {
      isPending: createMutation.isPending,
      error: createMutation.error,
      handle: handleCreate,
    },
    update: {
      isPending: updateMutation.isPending,
      error: updateMutation.error,
      handle: handleUpdate,
    },
    delete: {
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
      handle: handleDelete,
    },
  };
}
