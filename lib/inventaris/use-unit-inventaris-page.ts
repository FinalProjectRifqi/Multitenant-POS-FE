"use client";

import { useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import {
  useCreateInventarisMutation,
  useDeleteInventarisMutation,
  useInventarisItemsQuery,
  useUpdateInventarisMutation,
} from "@/lib/queries/inventaris";
import type {
  InventarisItem,
  InventarisItemFormValues,
} from "@/lib/schemas/inventaris";
import { buildInventarisStats } from "./stats";
import type { InventarisRow } from "./types";

const DEFAULT_FORM_VALUES: InventarisItemFormValues = {
  item_name: "",
  unit_of_measurement: "",
  current_stock: 0,
  max_stock: 1,
  min_stock: 0,
  description: "",
};

function toInventarisRow(
  unitId: string,
  items: InventarisItem[] | undefined,
): InventarisRow[] {
  if (!items) return [];
  return items
    .filter((item) => item.unit_id === unitId)
    .map((item) => ({
      ...item,
      is_low_stock: item.current_stock <= item.min_stock,
    }));
}

export function useUnitInventarisPage(unitId: string) {
  const inventarisQuery = useInventarisItemsQuery();

  const [viewingItem, setViewingItem] = useState<InventarisRow | null>(null);

  const items = useMemo(
    () => toInventarisRow(unitId, inventarisQuery.data),
    [unitId, inventarisQuery.data],
  );

  const stats = useMemo(() => buildInventarisStats(items), [items]);

  const createMutation = useCreateInventarisMutation();
  const updateMutation = useUpdateInventarisMutation();
  const deleteMutation = useDeleteInventarisMutation();

  const controller = useCrudPageController<
    InventarisRow,
    InventarisItemFormValues,
    { inventaris_id: string; payload: InventarisItemFormValues },
    { inventaris_id: string }
  >({
    defaultFormValues: DEFAULT_FORM_VALUES,
    listQuery: {
      data: items,
      isLoading: inventarisQuery.isLoading,
      isError: inventarisQuery.isError,
      error: inventarisQuery.error,
    },
    createMutation: {
      execute: (values) =>
        createMutation.createInventaris({ ...values, unit_id: unitId }),
      isPending: createMutation.isPending,
      error: createMutation.error,
    },
    updateMutation: {
      execute: (input) => updateMutation.updateInventaris(input),
      isPending: updateMutation.isPending,
      error: updateMutation.error,
    },
    deleteMutation: {
      execute: (input) => deleteMutation.deleteInventaris(input),
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
    },
    mapEntityToFormValues: (item): InventarisItemFormValues => ({
      item_name: item.item_name,
      unit_of_measurement: item.unit_of_measurement,
      current_stock: item.current_stock,
      max_stock: item.max_stock,
      min_stock: item.min_stock,
      description: item.description,
    }),
    toUpdateInput: ({ entity, values }) => ({
      inventaris_id: entity.inventaris_id,
      payload: values,
    }),
    toDeleteInput: (entity) => ({
      inventaris_id: entity.inventaris_id,
    }),
  });

  return {
    items: controller.items,
    stats,

    query: controller.query,
    isCreateOpen: controller.isCreateOpen,
    setIsCreateOpen: controller.setIsCreateOpen,
    editingItem: controller.editingItem,
    setEditingItem: controller.setEditingItem,
    deletingItem: controller.deletingItem,
    setDeletingItem: controller.setDeletingItem,
    viewingItem,
    setViewingItem,

    editInitialValues: controller.editInitialValues,
    create: controller.create,
    update: controller.update,
    delete: controller.delete,
  };
}
