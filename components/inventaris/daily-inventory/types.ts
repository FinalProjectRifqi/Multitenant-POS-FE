export type DailyInventoryTabValue = "planning" | "realization" | "report";

export type DailyInventoryTabCounts = Record<DailyInventoryTabValue, number>;

export type DailyInventorySectionProps = {
  unitId: string;
  selectedDate: string;
};

export type PlanningRowField = "planned_usage_qty" | "notes";

export type RealizationRowField = "actual_usage_qty" | "waste_qty" | "notes";

export type RealizationTotals = {
  planned: number;
  actual: number;
  waste: number;
  variance: number;
};
