"use client";

import { useQuery } from "@tanstack/react-query";

import { getTransactionHistory } from "@/lib/api/pos-orders";
import type { TransactionHistoryParams } from "@/lib/orders/types";

export const transactionHistoryQueryKeys = {
  all: () => ["transaction-history"] as const,
  lists: () => [...transactionHistoryQueryKeys.all(), "list"] as const,
  list: (unitId: string, params?: TransactionHistoryParams) =>
    [...transactionHistoryQueryKeys.lists(), { unitId, ...params }] as const,
};

export function useTransactionHistoryQuery(
  unitId: string,
  params?: TransactionHistoryParams,
) {
  return useQuery({
    queryKey: transactionHistoryQueryKeys.list(unitId, params),
    queryFn: () => getTransactionHistory(unitId, params),
    enabled: Boolean(unitId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    meta: { errorTitle: "Gagal Memuat Riwayat Transaksi" },
  });
}
