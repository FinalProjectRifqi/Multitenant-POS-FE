"use client";

import { useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import type {
  TransactionHistoryPaymentMethod,
  TransactionHistorySortBy,
  TransactionHistorySortType,
} from "@/lib/orders/types";
import { ORDER_STATUS } from "@/lib/orders/constants";
import { useTransactionHistoryQuery } from "@/lib/queries/transaction-history";
import { useUnitsQuery } from "@/lib/queries/unit";

const DEFAULT_SORT_BY: TransactionHistorySortBy = "ordered_at";
const DEFAULT_SORT_TYPE: TransactionHistorySortType = "DESC";

export type TransactionHistoryFilters = {
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: TransactionHistoryPaymentMethod;
  sortBy: TransactionHistorySortBy;
};

export function useTransactionHistoryPage(unitId?: string) {
  const currentUser = useCurrentUser();
  const shouldLookupUnitList = Boolean(unitId);
  const resolvedUnitId = unitId ?? currentUser?.unit?.unit_id ?? "";

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState<TransactionHistoryFilters>({
    sortBy: DEFAULT_SORT_BY,
  });

  const params = useMemo(
    () => ({
      status_id: ORDER_STATUS.COMPLETE,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
      payment_method: filters.paymentMethod,
      sortBy: filters.sortBy,
      sortType: DEFAULT_SORT_TYPE,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }),
    [filters, pagination.pageIndex, pagination.pageSize],
  );

  const historyQuery = useTransactionHistoryQuery(resolvedUnitId, params);
  const unitsQuery = useUnitsQuery(1, 100, false, shouldLookupUnitList);

  const selectedUnit = useMemo(() => {
    if (shouldLookupUnitList) {
      const unit = unitsQuery.data?.data.find(
        (item) => item.business_unit_id === resolvedUnitId,
      );

      if (unit) return unit;
    }

    if (!currentUser?.unit || currentUser.unit.unit_id !== resolvedUnitId) {
      return null;
    }

    return {
      business_unit_id: currentUser.unit.unit_id,
      business_unit_name: currentUser.unit.unit_name,
      business_unit_address: currentUser.unit.unit_address,
      business_unit_phone: currentUser.unit.phone_number,
      business_unit_status: currentUser.unit.status === "active",
    };
  }, [currentUser, resolvedUnitId, shouldLookupUnitList, unitsQuery.data]);

  function updateFilters(next: Partial<TransactionHistoryFilters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function resetFilters() {
    setFilters({
      sortBy: DEFAULT_SORT_BY,
    });
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  return {
    unitId: resolvedUnitId,
    selectedUnit,
    transactions: historyQuery.data?.data ?? [],
    meta: historyQuery.data?.meta,
    filters,
    updateFilters,
    resetFilters,
    pagination,
    setPagination,
    query: {
      isLoading:
        historyQuery.isLoading ||
        (shouldLookupUnitList && unitsQuery.isLoading),
      isError: historyQuery.isError || (shouldLookupUnitList && unitsQuery.isError),
      error: historyQuery.error ?? (shouldLookupUnitList ? unitsQuery.error : null),
    },
  };
}
