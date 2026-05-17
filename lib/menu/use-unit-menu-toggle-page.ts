"use client";

import { useCallback, useMemo, useState } from "react";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useMenusQuery, useUpdateMenuMutation } from "@/lib/queries/menu";
import type { PaginationMeta } from "@/lib/schemas/unit";
import { buildMenuStats } from "./stats";
import type { MenuRow } from "./types";

/**
 * useUnitMenuTogglePage — drives the read-only menu management page for
 * TIM_DAPUR and STAF_UNIT roles.
 *
 * Intentionally exposes ONLY:
 *   - a paginated read of the current unit's menus
 *   - a single toggle action to flip `is_available` (active / inactive)
 *
 * No create, no delete, no full edit.
 */
export function useUnitMenuTogglePage() {
  const user = useCurrentUser();
  const unitId = user?.unit?.unit_id ?? "";
  const unitName = user?.unit?.unit_name ?? "Unit Usaha";

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  /** Tracks which menu_id is currently being toggled (for per-row loading state). */
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const menusQuery = useMenusQuery(unitId, { page, limit });
  const {
    updateMenu,
    isPending: isUpdatePending,
    error: updateError,
  } = useUpdateMenuMutation();

  const menuData = menusQuery.data?.data;
  const menuItems = useMemo<MenuRow[]>(
    () => (menuData ?? []) as MenuRow[],
    [menuData],
  );

  /**
   * Set the target availability for a single menu item.
   * Optimistic update is handled inside `useUpdateMenuMutation`.
   */
  const updateAvailability = useCallback(
    async (item: MenuRow, nextIsAvailable: boolean) => {
      if (item.is_available === nextIsAvailable) return;

      setTogglingId(item.menu_id);
      try {
        await updateMenu({
          menu_id: item.menu_id,
          businessId: unitId,
          payload: { is_available: nextIsAvailable },
        });
      } finally {
        setTogglingId(null);
      }
    },
    [unitId, updateMenu],
  );

  const stats = useMemo(() => buildMenuStats(menuItems), [menuItems]);

  return {
    unitId,
    unitName,
    stats,

    menuItems,
    query: {
      isLoading: menusQuery.isLoading,
      isError: menusQuery.isError,
      error: menusQuery.error,
      meta: menusQuery.data?.meta as PaginationMeta | undefined,
    },

    pagination,
    setPagination,

    toggle: {
      handle: updateAvailability,
      togglingId,
      isPending: isUpdatePending,
      error: updateError,
    },
  };
}
