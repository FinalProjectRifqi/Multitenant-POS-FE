"use client";

import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { UnitEntity } from "@/lib/schemas/unit";

interface InventarisUnitSelectorProps {
  units: UnitEntity[];
  isLoading?: boolean;
}

export function InventarisUnitSelector({
  units,
  isLoading = false,
}: InventarisUnitSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-primary-foreground p-6 space-y-4"
          >
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-primary-foreground px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground">
          Tidak ada unit usaha aktif.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {units.map((unit) => (
        <div
          key={unit.unit_id}
          className="group bg-primary-foreground rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <PackageSearch className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 className="font-semibold text-foreground">{unit.unit_name}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lihat Daftar Inventaris pada {unit.unit_name}
            </p>
          </div>
          <Link
            href={`/group/inventaris/${unit.unit_id}`}
            className="text-xs font-medium text-primary hover:underline underline-offset-2 self-start"
          >
            Lihat Inventaris →
          </Link>
        </div>
      ))}
    </div>
  );
}
