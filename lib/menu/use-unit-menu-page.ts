"use client";

import { useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import {
  useCreateMenuMutation,
  useDeleteMenuMutation,
  useMenusQuery,
  useUpdateMenuMutation,
} from "@/lib/queries/menu";
import { useUnitsQuery } from "@/lib/queries/unit";
import type { CreateMenuRequest, MenuEntity } from "@/lib/schemas/menu";
import { DEFAULT_MENU_ITEM_FORM_VALUES } from "./constants";
import { buildMenuStats } from "./stats";
import type { MenuRow } from "./types";

/**
 * useUnitMenuPage — drives the menu CRUD page for a specific unit.
 * The `unitId` comes from the URL parameter (dynamic route segment).
 *
 * Follows the same pattern as useUserPage in lib/user/use-user-page.tsx.
 */
export function useUnitMenuPage(unitId: string) {
  const [viewingItem, setViewingItem] = useState<MenuRow | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const unitsQuery = useUnitsQuery();
  const menusQuery = useMenusQuery(unitId, { page, limit, search });

  const createMutation = useCreateMenuMutation(unitId);
  const updateMutation = useUpdateMenuMutation();
  const deleteMutation = useDeleteMenuMutation();

  const selectedUnit = useMemo(() => {
    const units = unitsQuery.data?.data ?? [];
    return units.find((unit) => unit.business_unit_id === unitId) ?? null;
  }, [unitId, unitsQuery.data]);

  const controller = useCrudPageController({
    defaultFormValues: DEFAULT_MENU_ITEM_FORM_VALUES,
    listQuery: {
      data: menusQuery.data?.data as MenuRow[] | undefined,
      meta: menusQuery.data?.meta,
      isLoading: menusQuery.isLoading,
      isError: menusQuery.isError,
      error: menusQuery.error,
    },
    createMutation: {
      execute: createMutation.createMenu,
      isPending: createMutation.isPending,
      error: createMutation.error,
    },
    updateMutation: {
      execute: updateMutation.updateMenu,
      isPending: updateMutation.isPending,
      error: updateMutation.error,
    },
    deleteMutation: {
      execute: deleteMutation.deleteMenu,
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
    },
    mapEntityToFormValues: (item: MenuEntity): CreateMenuRequest => ({
      menu_name: item.menu_name,
      menu_category_id: item.menu_category_id,
      item_price: item.menu_price,
      is_available: item.is_available,
      // Pass the existing URL so the form can show it as a preview.
      // toFormData() will NOT re-upload this string — only a File triggers upload.
      menu_image: item.menu_image || undefined,
    }),
    toUpdateInput: ({ entity, values }) => ({
      menu_id: entity.menu_id,
      businessId: unitId,
      payload: values,
    }),
    toDeleteInput: (entity) => ({
      menu_id: entity.menu_id,
      businessId: unitId,
    }),
  });



  const stats = useMemo(
    () => buildMenuStats(controller.items),
    [controller.items],
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  return {
    selectedUnit,
    stats,

    menuItems: controller.items,
    editInitialValues: controller.editInitialValues,

    query: controller.query,
    search,
    setSearch: handleSearchChange,
    pagination,
    setPagination,

    isCreateOpen: controller.isCreateOpen,
    setIsCreateOpen: controller.setIsCreateOpen,
    editingItem: controller.editingItem,
    setEditingItem: controller.setEditingItem,
    deletingItem: controller.deletingItem,
    setDeletingItem: controller.setDeletingItem,
    viewingItem,
    setViewingItem,

    create: controller.create,
    update: controller.update,
    delete: controller.delete,
  };
}
