"use client";

// lib/orders/use-order-list-page.ts

import { useState } from "react";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { ORDER_STATUS } from "@/lib/orders/constants";
import type { OrderListItem } from "@/lib/orders/types";
import {
  useCancelPosOrderMutation,
  usePosOrdersQuery,
} from "@/lib/queries/pos-orders";

export function useOrderListPage() {
  const user = useCurrentUser();
  const unitId = user?.unit?.unit_id ?? "";

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [activeStatusId, setActiveStatusId] = useState<string | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");
  const [deletingOrder, setDeletingOrder] = useState<OrderListItem | null>(
    null,
  );

  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;

  const ordersQuery = usePosOrdersQuery(
    unitId,
    {
      status_id: activeStatusId,
      search: search.trim() || undefined,
      page,
      limit,
    },
    30_000,
  );

  const statsQuery = usePosOrdersQuery(unitId, { limit: 100 }, 30_000);

  const cancelMutation = useCancelPosOrderMutation(unitId);

  function handleStatusChange(statusId: string | undefined) {
    setActiveStatusId(statusId);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  async function handleCancelConfirm() {
    if (!deletingOrder) return;
    await cancelMutation.cancelOrder(deletingOrder.order_id);
    setDeletingOrder(null);
  }

  // ── Stats derived from the unfiltered data ────────────────────────────────

  const allOrders = statsQuery.data?.data ?? [];

  const stats = {
    total: statsQuery.data?.meta.total ?? 0,
    active: allOrders.filter(
      (o) =>
        o.order_status_id === ORDER_STATUS.JUST_IN ||
        o.order_status_id === ORDER_STATUS.ON_PROCESS ||
        o.order_status_id === ORDER_STATUS.READY,
    ).length,
    completed: ORDER_STATUS.COMPLETE
      ? allOrders.filter((o) => o.order_status_id === ORDER_STATUS.COMPLETE)
          .length
      : 0,
    revenue: allOrders
      .filter(
        (o) => Boolean(ORDER_STATUS.COMPLETE) && o.order_status_id === ORDER_STATUS.COMPLETE,
      )
      .reduce((sum, o) => sum + o.total_amount, 0),
  };

  return {
    unitId,
    orders: ordersQuery.data?.data ?? [],
    totalRows: ordersQuery.data?.meta.total ?? 0,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    stats,
    pagination,
    setPagination,
    search,
    setSearch: handleSearchChange,
    activeStatusId,
    handleStatusChange,
    deletingOrder,
    setDeletingOrder,
    cancelMutation,
    handleCancelConfirm,
  };
}
