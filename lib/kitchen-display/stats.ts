import type { StatItem } from "@/components/shared/stats-grid";
import type { KdsStatus, OrderEntity } from "@/lib/schemas/order";

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
export function buildKdsStats(orders: OrderEntity[]): StatItem[] {
  const countByStatus = (status: KdsStatus) =>
    orders.filter((o) => o.kds_status === status).length;

  return [
    {
      label: "Total Pesanan",
      value: orders.length,
      description: "Semua pesanan aktif di dapur",
    },
    {
      label: "Diproses",
      value: countByStatus("diproses"),
      description: "Sedang dimasak oleh tim dapur",
    },
    {
      label: "Siap Disajikan",
      value: countByStatus("siap_disajikan"),
      description: "Siap untuk diantarkan ke pelanggan",
    },
  ];
}

/**
 * Returns the count of orders for each KDS status tab.
 * Used by the filter tab bar to show live badge counts.
 */
export function buildKdsFilterCounts(
  orders: OrderEntity[],
): Record<KdsStatus, number> {
  return {
    menunggu: orders.filter((o) => o.kds_status === "menunggu").length,
    diproses: orders.filter((o) => o.kds_status === "diproses").length,
    siap_disajikan: orders.filter((o) => o.kds_status === "siap_disajikan")
      .length,
  };
}
