import type { InventarisItem } from "@/lib/schemas/inventaris";
import type {
  DailyInventoryPlanItem,
  DailyInventoryRealizationItem,
} from "@/lib/schemas/daily-inventory";

export type PlanningDraftRow = {
  inventory_item_id: string;
  inventory_item_name: string;
  unit_of_measure: string;
  /** Current stock value shown as reference when filling planned usage. */
  current_stock: number;
  existing_plan_id: string | undefined;
  planned_usage_qty: number;
  notes: string;
};

export type RealizationDraftRow = {
  inventory_item_id: string;
  inventory_item_name: string;
  unit: string;
  plan_id: string;
  planned_usage_qty: number;
  actual_usage_qty: number;
  waste_qty: number;
  remaining_qty: number;
  notes: string;
  existing_realization_id: string | undefined;
  existing_status: "DRAFT" | "SUBMITTED" | undefined;
};

export function todayInputValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toNumber(value: string): number {
  if (value.trim() === "") return 0;
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

/**
 * variance = planned - actual - waste.
 * Positive = under usage. Negative = over usage.
 */
export function calculateVariance(
  plannedUsageQty: number,
  actualUsageQty: number,
  wasteQty: number,
): number {
  return plannedUsageQty - actualUsageQty - wasteQty;
}

export function buildPlanningDraftRows(
  items: InventarisItem[],
  existingPlans: DailyInventoryPlanItem[],
): PlanningDraftRow[] {
  const planMap = new Map(existingPlans.map((p) => [p.inventory_item_id, p]));
  return items.map((item) => {
    const plan = planMap.get(item.inventory_item_id);
    return {
      inventory_item_id: item.inventory_item_id,
      inventory_item_name: item.inventory_item_name,
      unit_of_measure: item.unit_of_measure,
      current_stock: item.current_stock,
      existing_plan_id: plan?.daily_inventory_plan_id,
      planned_usage_qty: plan?.planned_usage_qty ?? 0,
      notes: plan?.notes ?? "",
    };
  });
}

export function buildRealizationDraftRows(
  plans: DailyInventoryPlanItem[],
  existingRealizations: DailyInventoryRealizationItem[],
): RealizationDraftRow[] {
  const realizationMap = new Map(
    existingRealizations.map((r) => [r.daily_inventory_plan_id, r]),
  );
  return plans.map((plan) => {
    const realization = realizationMap.get(plan.daily_inventory_plan_id);
    return {
      inventory_item_id: plan.inventory_item_id,
      inventory_item_name: plan.inventory_item_name ?? plan.inventory_item_id,
      unit: realization?.unit ?? plan.unit,
      plan_id: plan.daily_inventory_plan_id,
      planned_usage_qty: plan.planned_usage_qty,
      actual_usage_qty: realization?.actual_usage_qty ?? 0,
      waste_qty: realization?.waste_qty ?? 0,
      remaining_qty: realization?.remaining_qty ?? 0,
      notes: realization?.notes ?? plan.notes ?? "",
      existing_realization_id: realization?.daily_inventory_realization_id,
      existing_status: realization?.status,
    };
  });
}
