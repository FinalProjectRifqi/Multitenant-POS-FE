/**
 * lib/kitchen-display/constants.ts
 *
 * UI-level metadata for KDS statuses.
 * Kept separate from lib/schemas/order.ts (which is a pure domain/validation
 * layer) so that presentation concerns (labels, Tailwind classes, action
 * labels, state transitions) don't bleed into the schema.
 */

import type { KdsStatus } from "@/lib/schemas/order";

export type KdsStatusMeta = {
  /** Human-readable label shown in badges and toast messages. */
  label: string;
  /** CTA label on the action Button. null = final state, no action available. */
  actionLabel: string | null;
  /** The status to transition to after the action. null = final state. */
  nextStatus: KdsStatus | null;
  /** Tailwind classes for the status pill/badge. */
  badgeClass: string;
  /** Tailwind class for the thin accent stripe at the top of a KDS card. */
  accentClass: string;
  /** Tailwind class for the subtle header background in the detail dialog. */
  headerBgClass: string;
};

export const KDS_STATUS_META: Record<KdsStatus, KdsStatusMeta> = {
  menunggu: {
    label: "Menunggu",
    actionLabel: "Mulai Proses",
    nextStatus: "diproses",
    badgeClass: "bg-amber-500 text-white",
    accentClass: "bg-amber-400",
    headerBgClass: "bg-amber-50",
  },
  diproses: {
    label: "Diproses",
    actionLabel: "Siap Disajikan",
    nextStatus: "siap_disajikan",
    badgeClass: "bg-blue-600 text-white",
    accentClass: "bg-blue-500",
    headerBgClass: "bg-blue-50",
  },
  siap_disajikan: {
    label: "Siap Disajikan",
    actionLabel: "Pesanan Selesai",
    nextStatus: null,
    badgeClass: "bg-primary text-primary-foreground",
    accentClass: "bg-primary",
    headerBgClass: "bg-primary/5",
  },
};

// ── Filter value type & tab definitions ───────────────────────────────────────

/** "all" shows every order; the KdsStatus values act as individual filters. */
export type KdsFilterValue = "all" | KdsStatus;

/** Ordered list of filter tabs shown in the KDS page tab bar. */
export const KDS_FILTER_TABS: { value: KdsFilterValue; label: string }[] = [
  { value: "all", label: "Semua Pesanan" },
  { value: "diproses", label: KDS_STATUS_META.diproses.label },
  { value: "siap_disajikan", label: KDS_STATUS_META.siap_disajikan.label },
  { value: "menunggu", label: KDS_STATUS_META.menunggu.label },
];
