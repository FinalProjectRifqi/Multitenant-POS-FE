"use client";

import { useGroupInventarisPage } from "@/lib/inventaris/use-group-inventaris-page";
import { InventarisUnitSelector } from "@/components/inventaris/inventaris-unit-selector";
import { PageHeader } from "@/components/dashboard/ui";

export default function Page() {
  const p = useGroupInventarisPage();

  return (
    <div className="space-y-6 p-8">
      {/* ── Page heading ── */}
      <PageHeader
        title="Kelola Inventaris"
        description="Kelola daftar inventaris yang tersedia di seluruh unit"
      />

      {/* ── Unit selector grid ── */}
      <InventarisUnitSelector units={p.units} isLoading={p.query.isLoading} />
    </div>
  );
}
