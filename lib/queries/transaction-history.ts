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
  const normalizedParams = params
    ? {
        ...params,
        search: params.search?.trim() || undefined,
      }
    : undefined;

  return useQuery({
    queryKey: transactionHistoryQueryKeys.list(unitId, normalizedParams),
    queryFn: () => getTransactionHistory(unitId, normalizedParams),
    enabled: Boolean(unitId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    meta: { errorTitle: "Gagal Memuat Riwayat Transaksi" },
  });
}
