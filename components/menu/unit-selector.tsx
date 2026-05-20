"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { UnitEntity } from "@/lib/types/unit";

type UnitSelectorProps = {
  units: UnitEntity[];
  isLoading?: boolean;
};

export function UnitSelector({ units, isLoading = false }: UnitSelectorProps) {
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
            <Skeleton className="h-3 w-20" />
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
          key={unit.business_unit_id}
          className="group bg-primary-foreground rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300 flex flex-col gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 className="font-semibold text-foreground">{unit.business_unit_name}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {unit.business_unit_address}
            </p>
          </div>
          <Link
            href={`/group/menu/${unit.business_unit_id}`}
            className="text-xs font-medium text-primary hover:underline underline-offset-2 self-start"
          >
            Lihat Menu →
          </Link>
        </div>
      ))}
    </div>
  );
}
