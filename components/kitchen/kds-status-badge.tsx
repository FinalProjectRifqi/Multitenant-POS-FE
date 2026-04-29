"use client";

import { cn } from "@/lib/utils";
import { KDS_STATUS_META } from "@/lib/kitchen-display/constants";
import type { KdsStatus } from "@/lib/schemas/order";

type KdsStatusBadgeProps = {
  status: KdsStatus;
  className?: string;
};

/**
 * KdsStatusBadge
 *
 * Shared pill badge for KDS order status.
 * Used by KdsOrderCard and KdsOrderDetailDialog.
 */
export function KdsStatusBadge({ status, className }: KdsStatusBadgeProps) {
  const meta = KDS_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap",
        meta.badgeClass,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
