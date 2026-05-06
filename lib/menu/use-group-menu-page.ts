"use client";

import { useMemo, useState } from "react";

import { ROLE_CODE } from "@/lib/constants/roles";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useUnitsQuery } from "@/lib/queries/unit";
import type { UnitEntity } from "@/lib/types/unit";

/**
 * useGroupMenuPage — drives the unit-selector page at /group/menu.
 *
 * The group manager picks a unit here; the app then navigates to
 * /group/menu/[unitId] where the full CRUD is handled by useUnitMenuPage.
 */
export function useGroupMenuPage() {
  const user = useCurrentUser();
  const isGroupManager = user?.role?.role_code === ROLE_CODE.MANAJEMEN_GRUP;

  const unitsQuery = useUnitsQuery();

  const activeUnits = useMemo(
    () =>
      (unitsQuery.data?.data ?? []).filter(
        (unit) => unit.business_unit_status,
      ),
    [unitsQuery.data],
  );

  return {
    user,
    isGroupManager,
    activeUnits,
    isLoading: unitsQuery.isLoading,
    isError: unitsQuery.isError,
    error: unitsQuery.error,
  };
}

export type { UnitEntity };

// Re-export state type used in unit-selector
export type GroupMenuPageState = ReturnType<typeof useGroupMenuPage>;
