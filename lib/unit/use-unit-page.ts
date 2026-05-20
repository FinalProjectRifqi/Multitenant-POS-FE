"use client";

import { useCallback, useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useUnitsQuery,
  useUpdateUnitMutation,
} from "@/lib/queries/unit";
import type { CreateUnitRequest, UnitEntity } from "@/lib/types/unit";
import { DEFAULT_UNIT_FORM_VALUES } from "./constants";
import { buildUnitStats } from "./stats";

export function useUnitPage() {
  const [viewingUnit, setViewingUnit] = useState<UnitEntity | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");

  const [showInactive, setShowInactive] = useState(true);

  // API uses 1-based indexing for page
  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const unitsQuery = useUnitsQuery(page, limit, showInactive, true, search);
  const createMutation = useCreateUnitMutation();
  const updateMutation = useUpdateUnitMutation();
  const deleteMutation = useDeleteUnitMutation();

  const controller = useCrudPageController({
    defaultFormValues: DEFAULT_UNIT_FORM_VALUES,
    listQuery: {
      data: unitsQuery.data?.data,
      meta: unitsQuery.data?.meta,
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
      const {
        business_unit_name,
        business_unit_address,
        business_unit_phone,
        business_unit_status: is_active,
      } = unit;
      return {
        business_unit_name,
        business_unit_address,
        business_unit_phone,
        is_active,
      };
    },
    toUpdateInput: ({ entity, values }) => ({
      business_unit_id: entity.business_unit_id,
      payload: values,
    }),
    toDeleteInput: (entity) => ({
      business_unit_id: entity.business_unit_id,
    }),
  });

  const stats = useMemo(
    () => buildUnitStats(controller.items),
    [controller.items],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

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
    showInactive,
    setShowInactive,
    search,
    setSearch: handleSearchChange,
    pagination,
    setPagination,
    create: controller.create,
    update: controller.update,
    delete: controller.delete,
  };
}
