"use client";

import { cn } from "@/lib/utils";
import { KDS_STATUS_META } from "@/lib/kitchen-display/constants";
import type { KdsStatusId } from "@/lib/kitchen-display/constants";

type KdsStatusBadgeProps = {
  statusId: KdsStatusId;
  fallbackLabel?: string;
  className?: string;
};

/**
 * KdsStatusBadge
 *
 * Shared pill badge for KDS order status.
 * Used by KdsOrderCard and KdsOrderDetailDialog.
 */
export function KdsStatusBadge({
  statusId,
  fallbackLabel,
  className,
}: KdsStatusBadgeProps) {
  const meta = KDS_STATUS_META[statusId];
  const label = meta?.label ?? fallbackLabel ?? "Unknown";
  const badgeClass = meta?.badgeClass ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap",
        badgeClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
