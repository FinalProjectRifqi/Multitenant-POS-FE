"use client";

import { useMemo, useState } from "react";

import { buildKdsFilterCounts, buildKdsStats } from "@/lib/kitchen-display/stats";
import type { KdsFilterValue } from "@/lib/kitchen-display/constants";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { KDS_STATUS_IDS } from "@/lib/kitchen-display/constants";
import type { OrderListItem } from "@/lib/orders/types";
import { usePosOrderDetailQuery, usePosOrdersQuery } from "@/lib/queries/pos-orders";

export type { KdsFilterValue };

/**
 * useKitchenDisplayPage
 *
 * Centralises all state and derived data for the KDS page:
 *   – order list (with polling)
 *   – active filter (tab selection)
 *   – filtered order list
 *   – stats cards data
 *   – filter tab counts
 *   – detail-dialog state
 *   – status-update mutation
 */
export function useKitchenDisplayPage() {
  const user = useCurrentUser();
  const unitId = user?.unit?.unit_id ?? "";

  // ── Remote data ────────────────────────────────────────────────────────────
  const query = usePosOrdersQuery(unitId, { limit: 100, sortBy: "ordered_at", sortType: "DESC" }, 25_000);
  const orders: OrderListItem[] = query.data?.data ?? [];

  // ── Filter state ───────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<KdsFilterValue>("all");

  // ── Detail dialog state ────────────────────────────────────────────────────
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrderQuery = usePosOrderDetailQuery(unitId, selectedOrderId ?? "");
  const selectedOrder = selectedOrderQuery.data?.data ?? null;

  // ── Derived values (memoised) ─────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    const kdsOrders = orders.filter((o) => KDS_STATUS_IDS.includes(o.order_status_id));
    if (activeFilter === "all") return kdsOrders;
    return kdsOrders.filter((o) => o.order_status_id === activeFilter);
  }, [orders, activeFilter]);

  const stats = useMemo(() => buildKdsStats(orders), [orders]);

  const filterCounts = useMemo(() => buildKdsFilterCounts(orders), [orders]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Derived unit name: prefer the logged-in user's unit, fall back to generic label.
   */
  const unitName = user?.unit?.unit_name ?? "Unit Usaha";

  return {
    // Data
    orders,
    filteredOrders,
    stats,
    filterCounts,
    unitName,
    unitId,

    // Query state
    query,

    // Filter
    activeFilter,
    setActiveFilter,

    // Detail dialog
    selectedOrder,
    selectedOrderQuery,
    openOrderDetail: (order: OrderListItem) => setSelectedOrderId(order.order_id),
    closeOrderDetail: () => setSelectedOrderId(null),
  };
}
