"use client";

import { PageHeader } from "@/components/dashboard/ui";
import { InventarisUnitSelector } from "@/components/inventaris/inventaris-unit-selector";
import { useGroupInventarisPage } from "@/lib/inventaris/use-group-inventaris-page";

export function GroupInventarisPageContent() {
  const p = useGroupInventarisPage();

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Kelola Inventaris"
        description="Kelola daftar inventaris yang tersedia di seluruh unit"
      />
      <InventarisUnitSelector units={p.units} isLoading={p.query.isLoading} />
    </div>
  );
}
