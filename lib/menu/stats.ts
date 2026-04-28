import type { StatItem } from "@/components/shared/stats-grid";
import { formatCurrency } from "@/lib/menu/constants";
import type { MenuItemRow } from "@/lib/menu/types";

export function buildMenuStats(items: MenuItemRow[]): StatItem[] {
  const availableCount = items.filter((item) => item.is_available).length;

  const averagePrice =
    items.length === 0
      ? 0
      : Math.round(
          items.reduce((total, item) => total + item.item_price, 0) /
            items.length,
        );

  return [
    {
      label: "Total Menu",
      value: items.length,
      description: "Semua item menu pada unit terpilih",
    },
    {
      label: "Menu Tersedia",
      value: availableCount,
      description: "Item yang siap dipesan",
    },
    {
      label: "Menu Tidak Tersedia",
      value: items.length - availableCount,
      description: "Item yang sedang dinonaktifkan",
    },
    {
      label: "Rata-Rata Harga",
      value: formatCurrency(averagePrice),
      description: "Rata-rata harga semua menu",
    },
  ];
}
