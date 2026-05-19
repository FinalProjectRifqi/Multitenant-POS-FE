"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/dashboard/ui";
import { TransactionUnitSelector } from "@/components/transactions/transaction-unit-selector";
import { useUnitsQuery } from "@/lib/queries/unit";

export function GroupTransactionHistoryPageContent() {
  const unitsQuery = useUnitsQuery(1, 100, false);

  const activeUnits = useMemo(
    () =>
      (unitsQuery.data?.data ?? []).filter((unit) => unit.business_unit_status),
    [unitsQuery.data],
  );

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Riwayat Transaksi"
        description="Pilih unit usaha untuk melihat riwayat transaksi"
      />
      <TransactionUnitSelector
        units={activeUnits}
        isLoading={unitsQuery.isLoading}
      />
    </div>
  );
}
