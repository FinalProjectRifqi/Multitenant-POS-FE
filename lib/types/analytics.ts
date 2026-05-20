// lib/types/analytics.ts

export type AnalyticsPeriod = "today" | "7d" | "30d" | "month" | "quarter";

export interface AnalyticsKpiData {
  total_omzet: number;
  total_transaksi: number;
  rata_rata_order: number;
  selesai: number;
  dibatalkan: number;
  stok_kritis: number;
  omzet_growth_pct: number | null;
  transaksi_growth_pct: number | null;
  avg_growth_pct: number | null;
}

export interface AnalyticsKpiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AnalyticsKpiData;
}

export interface SalesTrendPoint {
  label: string;
  date: string;
  omzet: number;
  transaksi: number;
}

export interface AnalyticsSalesTrendResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SalesTrendPoint[];
}

export interface TopMenuRow {
  menu_item_id: string;
  menu_item_name: string;
  category_name: string;
  qty_terjual: number;
  pendapatan: number;
}

export interface AnalyticsTopMenusResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: TopMenuRow[];
}

export interface PaymentHistoryRow {
  payment_id: string;
  reference_number: string;
  order_number: string;
  amount: number;
  payment_method: "QRIS" | "Tunai";
  payment_status: string;
  created_at: string;
}

export interface AnalyticsPaymentsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PaymentHistoryRow[];
}

export type StockStatus = "OK" | "LOW" | "CRITICAL" | "OUT";

export interface InventoryStatusRow {
  inventory_item_id: string;
  inventory_item_name: string;
  current_stock: number;
  min_threshold: number;
  unit_of_measure: string;
  status: "LOW" | "CRITICAL" | "OUT";
}

export interface AnalyticsInventoryStatusData {
  low_or_critical: InventoryStatusRow[];
  out_of_stock: InventoryStatusRow[];
}

export interface AnalyticsInventoryStatusResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AnalyticsInventoryStatusData;
}

export interface DailyInventoryRow {
  inventory_item_name: string;
  unit: string;
  planned_usage_qty: number;
  actual_usage_qty: number;
  waste_qty: number | null;
  variance_qty: number;
}

export interface AnalyticsDailyInventoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DailyInventoryRow[];
}

// ─── Group Analytics ─────────────────────────────────────────────────────────

export interface GroupKpiData {
  total_omzet: number;
  total_transaksi: number;
  rata_rata_order: number;
  selesai: number;
  dibatalkan: number;
  stok_kritis: number;
}

export interface UnitPerformanceRow {
  unit_id: string;
  unit_name: string;
  omzet: number;
  transaksi: number;
  rata_rata_order: number;
  selesai: number;
  dibatalkan: number;
  stok_kritis: number;
}

export interface AnalyticsGroupSummaryData {
  kpi: GroupKpiData;
  sales_trend: SalesTrendPoint[];
  top_menus: TopMenuRow[];
  unit_performance: UnitPerformanceRow[];
}

export interface AnalyticsGroupSummaryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AnalyticsGroupSummaryData;
}

export interface UnitCompareRow {
  unit_id: string;
  unit_name: string;
  omzet: number;
  transaksi: number;
  rata_rata_order: number;
  selesai: number;
  dibatalkan: number;
  stok_kritis: number;
}

export interface AnalyticsGroupCompareResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: UnitCompareRow[];
}
