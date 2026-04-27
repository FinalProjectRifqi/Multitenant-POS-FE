"use client";

import { useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
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
  const [viewingUnit, setViewingUnit] = useState<UnitEntity | null>(null);

  const unitsQuery = useUnitsQuery();
  const createMutation = useCreateUnitMutation();
  const updateMutation = useUpdateUnitMutation();
  const deleteMutation = useDeleteUnitMutation();

  const controller = useCrudPageController({
    defaultFormValues: DEFAULT_UNIT_FORM_VALUES,
    listQuery: {
      data: unitsQuery.data,
      isLoading: unitsQuery.isLoading,
      isError: unitsQuery.isError,
      error: unitsQuery.error,
    },
    createMutation: {
      execute: createMutation.createUnit,
      isPending: createMutation.isPending,
      error: createMutation.error,
    },
    updateMutation: {
      execute: updateMutation.updateUnit,
      isPending: updateMutation.isPending,
      error: updateMutation.error,
    },
    deleteMutation: {
      execute: deleteMutation.deleteUnit,
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
    },
    mapEntityToFormValues: (unit: UnitEntity): CreateUnitRequest => {
      const { unit_name, unit_address, phone_number, status } = unit;
      return { unit_name, unit_address, phone_number, status };
    },
    toUpdateInput: ({ entity, values }) => ({
      unit_id: entity.unit_id,
      payload: values,
    }),
    toDeleteInput: (entity) => ({
      unit_id: entity.unit_id,
    }),
  });

  const stats = useMemo(
    () => buildUnitStats(controller.items),
    [controller.items],
  );

  return {
    units: controller.items,
    stats,
    editInitialValues: controller.editInitialValues,
    query: controller.query,
    isCreateOpen: controller.isCreateOpen,
    setIsCreateOpen: controller.setIsCreateOpen,
    editingUnit: controller.editingItem,
    setEditingUnit: controller.setEditingItem,
    deletingUnit: controller.deletingItem,
    setDeletingUnit: controller.setDeletingItem,
    viewingUnit,
    setViewingUnit,
    create: controller.create,
    update: controller.update,
    delete: controller.delete,
  };
}
