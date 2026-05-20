import type { StatItem } from "@/components/shared/stats-grid";
import type { InventarisStats } from "@/lib/schemas/inventaris";

export function buildInventarisStats(
  stats: InventarisStats | undefined,
  unitName?: string,
): StatItem[] {
  const unitLabel = unitName ? `pada ${unitName}` : "yang terdaftar";
  return [
    {
      label: "Total Inventaris",
      value: stats?.total_inventory_item ?? 0,
      description: `Semua Inventaris yang terdaftar ${unitLabel}`,
    },
    {
      label: "Jumlah Stok Inventaris Tersedia",
      value: stats?.inventory_item_normal_stock ?? 0,
      description: "Inventaris yang dapat dipakai",
    },
    {
      label: "Jumlah Inventaris Stok Rendah",
      value: stats?.inventory_item_low_stock ?? 0,
      description: "Inventaris yang perlu restok",
    },
    {
      label: "Jumlah Inventaris Stok Habis",
      value: stats?.inventory_item_out_of_stock ?? 0,
      description: "Inventaris yang tidak tersedia",
    },
  ];
}
