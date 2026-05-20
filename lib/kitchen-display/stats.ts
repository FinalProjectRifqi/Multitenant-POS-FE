import type { StatItem } from "@/components/shared/stats-grid";
import { ORDER_STATUS } from "@/lib/orders/constants";
import type { OrderListItem } from "@/lib/orders/types";
import { KDS_STATUS_IDS } from "@/lib/kitchen-display/constants";

/**
 * Derives the three KDS stat cards from the current order list.
 *
 * Shown stats (matches the design mockup):
 *   1. Total Pesanan  — all orders regardless of status
 *   2. Diproses       — orders with kds_status === "diproses"
 *   3. Siap Disajikan — orders with kds_status === "siap_disajikan"
 *
 * "Menunggu" count is intentionally excluded from the stat cards (it can be
 * derived from Total − Diproses − Siap Disajikan) but is surfaced via the
 * filter tabs below the cards.
 */
export function buildKdsStats(orders: OrderListItem[]): StatItem[] {
  const kdsOrders = orders.filter((o) =>
    KDS_STATUS_IDS.includes(o.order_status_id),
  );
  const countByStatusId = (statusId: string) =>
    kdsOrders.filter((o) => o.order_status_id === statusId).length;

  return [
    {
      label: "Total Pesanan",
      value: kdsOrders.length,
      description: "Semua pesanan yang tampil di KDS",
    },
    {
      label: "Menunggu",
      value: countByStatusId(ORDER_STATUS.JUST_IN),
      description: "Menunggu untuk mulai diproses oleh tim dapur",
    },
    {
      label: "Diproses",
      value: countByStatusId(ORDER_STATUS.ON_PROCESS),
      description: "Sedang dimasak oleh tim dapur",
    },
    {
      label: "Siap Disajikan",
      value: countByStatusId(ORDER_STATUS.READY),
      description: "Siap untuk diantarkan ke pelanggan",
    },
  ];
}

/**
 * Returns the count of orders for each KDS status tab.
 * Used by the filter tab bar to show live badge counts.
 */
export function buildKdsFilterCounts(
  orders: OrderListItem[],
): Record<string, number> {
  const kdsOrders = orders.filter((o) =>
    KDS_STATUS_IDS.includes(o.order_status_id),
  );
  return kdsOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.order_status_id] = (acc[o.order_status_id] ?? 0) + 1;
    return acc;
  }, {});
}
