import type { StatItem } from "@/components/shared/stats-grid";
import type { UnitEntity } from "@/lib/types/unit";

export function buildUnitStats(units: UnitEntity[]): StatItem[] {
  const activeCount = units.filter((u) => u.business_unit_status).length;

  return [
    {
      label: "Total Unit Usaha",
      value: units.length,
      description: "Semua unit usaha terdaftar",
    },
    {
      label: "Unit Aktif",
      value: activeCount,
      description: "Unit yang beroperasi",
    },
    {
      label: "Unit Tidak Aktif",
      value: units.length - activeCount,
      description: "Unit yang dinonaktifkan",
    },
  ];
}
