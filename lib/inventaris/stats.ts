import type { StatItem } from "@/components/shared/stats-grid";
import type { InventarisRow } from "@/lib/inventaris/types";

export function buildInventarisStats(items: InventarisRow[]): StatItem[] {
  const lowStockCount = items.filter((item) => item.is_low_stock).length;

  return [
    {
      label: "Total Item Inventaris",
      value: items.length,
      description: "Seluruh item yang terdaftar di sistem",
    },
    {
      label: "Inventaris Tersedia",
      value: items.length - lowStockCount,
      description: "Item dengan stok mencukupi",
    },
    {
      label: "Inventaris Menipis",
      value: lowStockCount,
      description: "Item yang perlu segera direstok",
    },
  ];
}
