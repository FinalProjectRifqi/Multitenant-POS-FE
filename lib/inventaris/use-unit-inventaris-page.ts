"use client";

import { useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import {
  useCreateInventarisMutation,
  useDeleteInventarisMutation,
  useInventarisItemsQuery,
  useInventarisStatsQuery,
  useUpdateInventarisMutation,
  type UpdateInventarisInput,
  type DeleteInventarisInput,
} from "@/lib/queries/inventaris";
import type {
  InventarisItem,
  InventarisItemFormValues,
} from "@/lib/schemas/inventaris";
import { buildInventarisStats } from "./stats";
import type { InventarisRow } from "./types";

const DEFAULT_FORM_VALUES: InventarisItemFormValues = {
  inventory_item_name: "",
  unit_of_measure: "",
  current_stock: 0,
  max_threshold: 1,
  min_threshold: 0,
  description: "",
};

function toInventarisRow(items: InventarisItem[] | undefined): InventarisRow[] {
  if (!items) return [];
  return items.map((item) => ({
    ...item,
    is_out_of_stock: item.current_stock === 0,
    is_low_stock:
      item.current_stock > 0 && item.current_stock <= item.min_threshold,
  }));
}

export function useUnitInventarisPage(businessId: string, unitName?: string) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");

  const params = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search || undefined,
  };

  const inventarisQuery = useInventarisItemsQuery(businessId, params);
  const statsQuery = useInventarisStatsQuery(businessId);

  const [viewingItem, setViewingItem] = useState<InventarisRow | null>(null);

  const items = useMemo(
    () => toInventarisRow(inventarisQuery.data?.data),
    [inventarisQuery.data],
  );

  const stats = useMemo(
    () => buildInventarisStats(statsQuery.data, unitName),
    [statsQuery.data, unitName],
  );

  const createMutation = useCreateInventarisMutation(businessId);
  const updateMutation = useUpdateInventarisMutation(businessId);
  const deleteMutation = useDeleteInventarisMutation(businessId);

  const controller = useCrudPageController<
    InventarisRow,
    InventarisItemFormValues,
    UpdateInventarisInput,
    DeleteInventarisInput
  >({
    defaultFormValues: DEFAULT_FORM_VALUES,
    listQuery: {
      data: items,
      meta: inventarisQuery.data?.meta,
      isLoading: inventarisQuery.isLoading,
      isError: inventarisQuery.isError,
      error: inventarisQuery.error,
    },
    createMutation: {
      execute: (values) => createMutation.createInventaris(values),
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
      inventory_item_name: item.inventory_item_name,
      unit_of_measure: item.unit_of_measure,
      current_stock: item.current_stock,
      max_threshold: item.max_threshold,
      min_threshold: item.min_threshold,
      description: item.description,
    }),
    toUpdateInput: ({ entity, values }) => ({
      payload: values,
      inventoryItemId: entity.inventory_item_id,
    }),
    toDeleteInput: (entity) => ({
      inventoryItemId: entity.inventory_item_id,
    }),
  });

  return {
    items: controller.items,
    stats,
    pagination,
    setPagination,
    search,
    setSearch,

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
