"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { UnitEntity } from "@/lib/types/unit";

type TransactionUnitSelectorProps = {
  units: UnitEntity[];
  isLoading?: boolean;
};

export function TransactionUnitSelector({
  units,
  isLoading = false,
}: TransactionUnitSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-2xl border border-border bg-primary-foreground p-6"
          >
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
            </div>
            <Skeleton className="h-3 w-32" />
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {units.map((unit) => (
        <div
          key={unit.business_unit_id}
          className="group flex flex-col gap-4 rounded-2xl border border-border bg-primary-foreground p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 className="font-semibold text-foreground">
              {unit.business_unit_name}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {unit.business_unit_address}
            </p>
          </div>
          <Link
            href={`/group/transaksi/${unit.business_unit_id}`}
            className="self-start text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            Lihat Riwayat Transaksi
          </Link>
        </div>
      ))}
    </div>
  );
}
