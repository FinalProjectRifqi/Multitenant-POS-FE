"use client";

// lib/queries/order-types.ts — React Query hook for fetching order types.

import { useQuery } from "@tanstack/react-query";
import { getOrderTypes } from "@/lib/api/pos-orders";

export function useOrderTypesQuery() {
  return useQuery({
    queryKey: ["order-types"],
    queryFn: () => getOrderTypes({ limit: 100 }),
    staleTime: 5 * 60 * 1000, // 5 minutes — order types rarely change
    meta: { errorTitle: "Gagal Memuat Tipe Pesanan" },
  });
}
