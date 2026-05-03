"use client";

import { useMemo, useState } from "react";

import { ROLE_CODE } from "@/lib/constants/roles";
import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
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
import type { UnitEntity } from "@/lib/types/unit";
import { DEFAULT_MENU_ITEM_FORM_VALUES } from "./constants";
import { buildMenuStats } from "./stats";
import type { MenuItemRow } from "./types";

function toMenuItemRow(
  selectedUnitId: string,
  items: ReturnType<typeof useMenuItemsQuery>["data"],
  categoriesById: Map<string, MenuCategoryEntity>,
  categoryIdsForUnit: Set<string>,
): MenuItemRow[] {
  if (!selectedUnitId || !items) {
    return [];
  }

  return items
    .filter((item) => categoryIdsForUnit.has(item.menu_category_id))
    .map((item) => {
      const category = categoriesById.get(item.menu_category_id);

      return {
        ...item,
        category_name: category?.category_name ?? "-",
        unit_id: category?.unit_id ?? selectedUnitId,
      };
    });
}

export function useGroupMenuPage() {
  const user = useCurrentUser();
  const isGroupManager = user?.role?.role_code === ROLE_CODE.MANAJEMEN_GRUP;

  const unitsQuery = useUnitsQuery();
  const categoriesQuery = useMenuCategoriesQuery();
  const menuItemsQuery = useMenuItemsQuery();

  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    if (user?.role?.role_code === ROLE_CODE.MANAJEMEN_GRUP) {
      return "";
    }

    return user?.unit?.unit_id ?? "";
  });

  const [viewingItem, setViewingItem] = useState<MenuItemRow | null>(null);

  const units = useMemo(
    () => (unitsQuery.data?.data ?? []).filter((unit) => unit.business_unit_status),
    [unitsQuery.data],
  );

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.business_unit_id === selectedUnitId) ?? null,
    [selectedUnitId, units],
  );

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );

  const categoriesForUnit = useMemo(() => {
    if (!selectedUnitId) {
      return [];
    }

    return categories.filter(
      (category) => category.unit_id === selectedUnitId && category.is_active,
    );
  }, [categories, selectedUnitId]);

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
        selectedUnitId,
        menuItemsQuery.data,
        categoriesById,
        categoryIdsForUnit,
      ),
    [selectedUnitId, menuItemsQuery.data, categoriesById, categoryIdsForUnit],
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

  function handleSelectUnit(nextUnitId: string) {
    setSelectedUnitId(nextUnitId);
    setViewingItem(null);
    controller.setEditingItem(null);
    controller.setDeletingItem(null);
    controller.setIsCreateOpen(false);
  }

  const stats = useMemo(
    () => buildMenuStats(controller.items),
    [controller.items],
  );

  const canAccessMenu = !isGroupManager || Boolean(selectedUnitId);
  const canCreateMenu = canAccessMenu && categoriesForUnit.length > 0;

  return {
    user,
    isGroupManager,
    units,
    selectedUnitId,
    setSelectedUnitId: handleSelectUnit,
    selectedUnit,
    categoriesForUnit,
    canAccessMenu,
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

export type { UnitEntity };
