/**
 * components/kitchen/index.ts
 *
 * Barrel export for all Kitchen Display System UI components.
 * Import from "@/components/kitchen" instead of deep paths.
 *
 * @example
 *   import { KdsOrderCard, KdsFilterTabs, KdsOrderDetailDialog } from "@/components/kitchen";
 */

export { KdsStatusBadge } from "./kds-status-badge";

export { KdsFilterTabs } from "./kds-filter-tabs";
export type { KdsFilterTabsProps } from "./kds-filter-tabs";

export { KdsOrderCard } from "./kds-order-card";
export type { KdsOrderCardProps } from "./kds-order-card";

export { KdsOrderDetailDialog } from "./kds-order-detail-dialog";
export type { KdsOrderDetailDialogProps } from "./kds-order-detail-dialog";
