import { useMemo, useState } from "react";

import { useUnitsQuery } from "@/lib/queries/unit";
import { useInventarisItemsQuery } from "@/lib/queries/inventaris";
import { buildInventarisStats } from "@/lib/inventaris/stats";
import type { InventarisRow } from "@/lib/inventaris/types";
import type { InventarisItem } from "@/lib/schemas/inventaris";

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

export function useGroupInventarisPage() {
  const unitsQuery = useUnitsQuery();
  const inventarisQuery = useInventarisItemsQuery();

  const units = useMemo(
    () => (unitsQuery.data ?? []).filter((unit) => unit.status === "active"),
    [unitsQuery.data],
  );

  return {
    units,
    query: {
      isLoading: unitsQuery.isLoading || inventarisQuery.isLoading,
      isError: unitsQuery.isError || inventarisQuery.isError,
      error: unitsQuery.error ?? inventarisQuery.error,
    },
  };
}

export function useGroupInventarisUnitPage(unitId: string) {
  const unitsQuery = useUnitsQuery();
  const inventarisQuery = useInventarisItemsQuery();

  const [viewingItem, setViewingItem] = useState<InventarisRow | null>(null);

  const units = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data]);

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.unit_id === unitId) ?? null,
    [units, unitId],
  );

  const items = useMemo(
    () => toInventarisRow(unitId, inventarisQuery.data),
    [unitId, inventarisQuery.data],
  );

  const stats = useMemo(() => buildInventarisStats(items), [items]);

  return {
    selectedUnit,
    items,
    stats,
    viewingItem,
    setViewingItem,
    query: {
      isLoading: unitsQuery.isLoading || inventarisQuery.isLoading,
      isError: unitsQuery.isError || inventarisQuery.isError,
      error: unitsQuery.error ?? inventarisQuery.error,
    },
  };
}
