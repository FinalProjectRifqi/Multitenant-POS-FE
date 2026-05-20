"use client";

import { useMemo, useState } from "react";

import { useUnitsQuery } from "@/lib/queries/unit";
import {
  useInventarisItemsQuery,
  useInventarisStatsQuery,
} from "@/lib/queries/inventaris";
import { buildInventarisStats } from "@/lib/inventaris/stats";
import type { InventarisRow } from "@/lib/inventaris/types";
import type { InventarisItem } from "@/lib/schemas/inventaris";

function toInventarisRow(items: InventarisItem[] | undefined): InventarisRow[] {
  if (!items) return [];
  return items.map((item) => ({
    ...item,
    is_out_of_stock: item.current_stock === 0,
    is_low_stock:
      item.current_stock > 0 && item.current_stock <= item.min_threshold,
  }));
}

export function useGroupInventarisPage() {
  const unitsQuery = useUnitsQuery(1, 100, false);

  const units = useMemo(
    () =>
      (unitsQuery.data?.data ?? []).filter((unit) => unit.business_unit_status),
    [unitsQuery.data],
  );

  return {
    units,
    query: {
      isLoading: unitsQuery.isLoading,
      isError: unitsQuery.isError,
      error: unitsQuery.error,
    },
  };
}

export function useGroupInventarisUnitPage(unitId: string) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");

  const params = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search || undefined,
  };

  const unitsQuery = useUnitsQuery();
  const inventarisQuery = useInventarisItemsQuery(unitId, params);
  const statsQuery = useInventarisStatsQuery(unitId);

  const [viewingItem, setViewingItem] = useState<InventarisRow | null>(null);

  const units = useMemo(() => unitsQuery.data?.data ?? [], [unitsQuery.data]);

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.business_unit_id === unitId) ?? null,
    [units, unitId],
  );

  const items = useMemo(
    () => toInventarisRow(inventarisQuery.data?.data),
    [inventarisQuery.data],
  );

  const stats = useMemo(
    () =>
      buildInventarisStats(statsQuery.data, selectedUnit?.business_unit_name),
    [statsQuery.data, selectedUnit],
  );

  return {
    selectedUnit,
    items,
    stats,
    pagination,
    setPagination,
    search,
    setSearch,
    viewingItem,
    setViewingItem,
    query: {
      isLoading: unitsQuery.isLoading || inventarisQuery.isLoading,
      isError: unitsQuery.isError || inventarisQuery.isError,
      error: unitsQuery.error ?? inventarisQuery.error,
      meta: inventarisQuery.data?.meta,
    },
  };
}
