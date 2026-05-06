"use client";

import { useMemo } from "react";
import { useUnitsQuery } from "@/lib/queries/unit";
import { UnitSelector } from "@/components/menu/unit-selector";

/**
 * MenuSelectorContent — Client Component
 *
 * Renders the unit-selection grid so the group manager can pick a unit.
 * Data comes from the prefetched HydrationBoundary in the server page.
 */
export function MenuSelectorContent() {
  const unitsQuery = useUnitsQuery();

  const activeUnits = useMemo(
    () =>
      (unitsQuery.data?.data ?? []).filter((unit) => unit.business_unit_status),
    [unitsQuery.data],
  );

  return (
    <div className="space-y-6 p-8">
      {/* ── Page heading ── */}
      <section className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Kelola Menu
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih unit usaha untuk melihat dan mengelola daftar menu
        </p>
      </section>

      {/* ── Unit selector grid ── */}
      <UnitSelector units={activeUnits} isLoading={unitsQuery.isLoading} />
    </div>
  );
}
