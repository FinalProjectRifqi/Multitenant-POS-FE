"use client";

import { useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import {
  useCreateMenuItemMutation,
  useDeleteMenuItemMutation,
  useMenuCategoriesQuery,
  useMenuItemsQuery,
  useUpdateMenuItemMutation,
} from "@/lib/queries/menu";
import { useUnitsQuery } from "@/lib/queries/unit";
import type {
  CreateMenuItemRequest,
  MenuCategoryEntity,
} from "@/lib/schemas/menu";
import { DEFAULT_MENU_ITEM_FORM_VALUES } from "./constants";
import { buildMenuStats } from "./stats";
import type { MenuItemRow } from "./types";

function toMenuItemRow(
  unitId: string,
  items: ReturnType<typeof useMenuItemsQuery>["data"],
  categoriesById: Map<string, MenuCategoryEntity>,
  categoryIdsForUnit: Set<string>,
): MenuItemRow[] {
  if (!unitId || !items) {
    return [];
  }

  return items
    .filter((item) => categoryIdsForUnit.has(item.menu_category_id))
    .map((item) => {
      const category = categoriesById.get(item.menu_category_id);

      return {
        ...item,
        category_name: category?.category_name ?? "-",
        unit_id: category?.unit_id ?? unitId,
      };
    });
}

/**
 * useUnitMenuPage — drives the menu CRUD page for a specific unit.
 * The `unitId` comes from the URL parameter (dynamic route segment).
 */
export function useUnitMenuPage(unitId: string) {
  const unitsQuery = useUnitsQuery();
  const categoriesQuery = useMenuCategoriesQuery();
  const menuItemsQuery = useMenuItemsQuery();

  const [viewingItem, setViewingItem] = useState<MenuItemRow | null>(null);

  const selectedUnit = useMemo(() => {
    const unitsList = unitsQuery.data?.data ?? [];
    return unitsList.find((unit) => unit.business_unit_id === unitId) ?? null;
  }, [unitId, unitsQuery.data]);

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );

  const categoriesForUnit = useMemo(() => {
    if (!unitId) {
      return [];
    }

    return categories.filter(
      (category) => category.unit_id === unitId && category.is_active,
    );
  }, [categories, unitId]);

  const categoriesById = useMemo(
    () =>
      new Map(
        categories.map((category) => [category.menu_category_id, category]),
      ),
    [categories],
  );

  const categoryIdsForUnit = useMemo(
    () =>
      new Set(categoriesForUnit.map((category) => category.menu_category_id)),
    [categoriesForUnit],
  );

  const menuItems = useMemo(
    () =>
      toMenuItemRow(
        unitId,
        menuItemsQuery.data,
        categoriesById,
        categoryIdsForUnit,
      ),
    [unitId, menuItemsQuery.data, categoriesById, categoryIdsForUnit],
  );

  const createInitialValues = useMemo<CreateMenuItemRequest>(
    () => ({
      ...DEFAULT_MENU_ITEM_FORM_VALUES,
      menu_category_id:
        categoriesForUnit[0]?.menu_category_id ??
        DEFAULT_MENU_ITEM_FORM_VALUES.menu_category_id,
    }),
    [categoriesForUnit],
  );

  const createMutation = useCreateMenuItemMutation();
  const updateMutation = useUpdateMenuItemMutation();
  const deleteMutation = useDeleteMenuItemMutation();

  const controller = useCrudPageController({
    defaultFormValues: createInitialValues,
    listQuery: {
      data: menuItems,
      isLoading:
        unitsQuery.isLoading ||
        categoriesQuery.isLoading ||
        menuItemsQuery.isLoading,
      isError:
        unitsQuery.isError || categoriesQuery.isError || menuItemsQuery.isError,
      error: unitsQuery.error ?? categoriesQuery.error ?? menuItemsQuery.error,
    },
    createMutation: {
      execute: createMutation.createMenuItem,
      isPending: createMutation.isPending,
      error: createMutation.error,
    },
    updateMutation: {
      execute: updateMutation.updateMenuItem,
      isPending: updateMutation.isPending,
      error: updateMutation.error,
    },
    deleteMutation: {
      execute: deleteMutation.deleteMenuItem,
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
    },
    mapEntityToFormValues: (item): CreateMenuItemRequest => ({
      menu_category_id: item.menu_category_id,
      menu_item_name: item.menu_item_name,
      image_url: item.image_url,
      item_price: item.item_price,
      is_available: item.is_available,
    }),
    toUpdateInput: ({ entity, values }) => ({
      menu_item_id: entity.menu_item_id,
      payload: values,
    }),
    toDeleteInput: (entity) => ({
      menu_item_id: entity.menu_item_id,
    }),
  });

  const stats = useMemo(
    () => buildMenuStats(controller.items),
    [controller.items],
  );

  const canCreateMenu = categoriesForUnit.length > 0;

  return {
    selectedUnit,
    categoriesForUnit,
    canCreateMenu,
    createInitialValues,

    menuItems: controller.items,
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
