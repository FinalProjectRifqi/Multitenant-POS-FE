"use client";

import { useMemo, useState } from "react";

import { buildKdsFilterCounts, buildKdsStats } from "@/lib/kitchen-display/stats";
import {
  useOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/lib/queries/order";
import type { KdsFilterValue } from "@/lib/kitchen-display/constants";
import type { KdsStatus, OrderEntity } from "@/lib/schemas/order";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

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

  // ── Remote data ────────────────────────────────────────────────────────────
  const query = useOrdersQuery();
  const orders: OrderEntity[] = query.data ?? [];

  // ── Status-update mutation ─────────────────────────────────────────────────
  const updateMutation = useUpdateOrderStatusMutation();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<KdsFilterValue>("all");

  // ── Detail dialog state ────────────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<OrderEntity | null>(null);

  // ── Derived values (memoised) ─────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    return orders.filter((o) => o.kds_status === activeFilter);
  }, [orders, activeFilter]);

  const stats = useMemo(() => buildKdsStats(orders), [orders]);

  const filterCounts = useMemo(() => buildKdsFilterCounts(orders), [orders]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Advances the order to its next KDS status.
   * The caller is responsible for only invoking this when nextStatus !== null.
   */
  async function handleAdvanceStatus(order: OrderEntity, nextStatus: KdsStatus) {
    await updateMutation.updateOrderStatus({
      order_id: order.order_id,
      payload: { kds_status: nextStatus },
    });

    // Keep the dialog in sync: if the order being viewed is the one updated,
    // reflect the new status immediately (optimistic cache already updated it,
    // but selectedOrder is a snapshot — re-point to the live order).
    if (selectedOrder?.order_id === order.order_id) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, kds_status: nextStatus } : prev,
      );
    }
  }

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

    // Query state
    query,

    // Filter
    activeFilter,
    setActiveFilter,

    // Detail dialog
    selectedOrder,
    openOrderDetail: setSelectedOrder,
    closeOrderDetail: () => setSelectedOrder(null),

    // Mutation
    handleAdvanceStatus,
    updateIsPending: updateMutation.isPending,
    pendingOrderId: updateMutation.pendingOrderId,
  };
}
