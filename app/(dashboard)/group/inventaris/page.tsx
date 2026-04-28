"use client";

import { useGroupInventarisPage } from "@/lib/inventaris/use-group-inventaris-page";
import { InventarisUnitSelector } from "@/components/inventaris/inventaris-unit-selector";

export default function Page() {
  const p = useGroupInventarisPage();

  return (
    <div className="space-y-6 p-8">
      {/* ── Page heading ── */}
      <section className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Kelola Inventaris
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola Daftar Inventaris yang Tersedia di Seluruh Unit
        </p>
      </section>

      {/* ── Unit selector grid ── */}
      <InventarisUnitSelector units={p.units} isLoading={p.query.isLoading} />
    </div>
  );
}
