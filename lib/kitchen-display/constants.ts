/**
 * lib/kitchen-display/constants.ts
 *
 * KDS uses POS Orders (`/orders/:unitId`) as its source of truth.
 * That API exposes status as `order_status_id` (UUID), so our KDS "status"
 * identifiers are UUID strings coming from NEXT_PUBLIC_* env vars.
 */

import { ORDER_STATUS, ORDER_STATUS_LABEL } from "@/lib/orders/constants";

export type KdsStatusId = string;

export type KdsStatusMeta = {
  /** Human-readable label shown in badges. */
  label: string;
  /** Tailwind classes for the status pill/badge. */
  badgeClass: string;
  /** Tailwind class for the thin accent stripe at the top of a KDS card. */
  accentClass: string;
  /** Tailwind class for the subtle header background in the detail dialog. */
  headerBgClass: string;
};

export const KDS_STATUS_IDS = [
  ORDER_STATUS.JUST_IN,
  ORDER_STATUS.ON_PROCESS,
  ORDER_STATUS.READY,
  ORDER_STATUS.CANCEL,
] as const satisfies readonly string[];

export const KDS_STATUS_META: Record<KdsStatusId, KdsStatusMeta> = {
  [ORDER_STATUS.JUST_IN]: {
    label: ORDER_STATUS_LABEL[ORDER_STATUS.JUST_IN],
    badgeClass: "bg-amber-500 text-white",
    accentClass: "bg-amber-400",
    headerBgClass: "bg-amber-50",
  },
  [ORDER_STATUS.ON_PROCESS]: {
    label: ORDER_STATUS_LABEL[ORDER_STATUS.ON_PROCESS],
    badgeClass: "bg-blue-600 text-white",
    accentClass: "bg-blue-500",
    headerBgClass: "bg-blue-50",
  },
  [ORDER_STATUS.READY]: {
    label: ORDER_STATUS_LABEL[ORDER_STATUS.READY],
    badgeClass: "bg-emerald-600 text-white",
    accentClass: "bg-emerald-500",
    headerBgClass: "bg-emerald-50",
  },
  [ORDER_STATUS.CANCEL]: {
    label: ORDER_STATUS_LABEL[ORDER_STATUS.CANCEL],
    badgeClass: "bg-destructive text-white",
    accentClass: "bg-destructive",
    headerBgClass: "bg-destructive/10",
  },
};

// ── Filter value type & tab definitions ───────────────────────────────────────

/** "all" shows every KDS-relevant order; other values filter by status_id. */
export type KdsFilterValue = "all" | KdsStatusId;

export const KDS_FILTER_TABS: { value: KdsFilterValue; label: string }[] = [
  { value: "all", label: "Semua" },
  {
    value: ORDER_STATUS.JUST_IN,
    label: ORDER_STATUS_LABEL[ORDER_STATUS.JUST_IN],
  },
  {
    value: ORDER_STATUS.ON_PROCESS,
    label: ORDER_STATUS_LABEL[ORDER_STATUS.ON_PROCESS],
  },
  { value: ORDER_STATUS.READY, label: ORDER_STATUS_LABEL[ORDER_STATUS.READY] },
  {
    value: ORDER_STATUS.CANCEL,
    label: ORDER_STATUS_LABEL[ORDER_STATUS.CANCEL],
  },
];
