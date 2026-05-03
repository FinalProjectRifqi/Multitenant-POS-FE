"use client";

import { ArrowLeft, Building2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { InventarisView } from "@/components/inventaris/inventaris-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupInventarisUnitPage } from "@/lib/inventaris/use-group-inventaris-page";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ unitId: string }>();
  const unitId = params.unitId;

  const p = useGroupInventarisUnitPage(unitId);

  const headerSlot = (
    <section className="space-y-3">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/group/inventaris")}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Pilih Unit
      </Button>

      {/* Page heading + unit info */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {p.query.isLoading ? (
            <Skeleton className="h-9 w-72 rounded" />
          ) : (
            `Kelola Inventaris${p.selectedUnit ? ` ${p.selectedUnit.business_unit_name}` : ""}`
          )}
        </h1>

        {p.query.isLoading ? (
          <Skeleton className="h-5 w-64 rounded" />
        ) : p.selectedUnit ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span>
              {p.selectedUnit.business_unit_name}
              <span className="mx-1.5 text-border">•</span>
              {p.selectedUnit.business_unit_address}
            </span>
          </div>
        ) : (
          <p className="text-sm text-destructive">
            Unit usaha tidak ditemukan.
          </p>
        )}
      </div>
    </section>
  );

  return (
    <InventarisView
      canEdit={false}
      title="Daftar Inventaris Unit Usaha"
      description={
        p.selectedUnit
          ? `Kelola Daftar Inventaris yang Tersedia di ${p.selectedUnit.business_unit_name}`
          : "Daftar barang inventaris pada unit terpilih"
      }
      headerSlot={headerSlot}
      items={p.items}
      stats={p.stats}
      query={p.query}
      viewingItem={p.viewingItem}
      setViewingItem={p.setViewingItem}
    />
  );
}
