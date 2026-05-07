"use client";

// components/orders/order-status-badge.tsx

import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS, ORDER_STATUS_LABEL } from "@/lib/orders/constants";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  statusId: string;
  statusName?: string;
  className?: string;
}

function getStatusStyle(statusId: string): string {
  switch (statusId) {
    case ORDER_STATUS.JUST_IN:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
    case ORDER_STATUS.ON_PROCESS:
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
    case ORDER_STATUS.READY:
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
    case ORDER_STATUS.COMPLETE:
      return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100";
    case ORDER_STATUS.CANCEL:
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
    default:
      return "bg-muted text-muted-foreground border-border hover:bg-muted";
  }
}

export function OrderStatusBadge({
  statusId,
  statusName,
  className,
}: OrderStatusBadgeProps) {
  const label = ORDER_STATUS_LABEL[statusId] ?? statusName ?? statusId;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium px-2 py-0.5 border",
        getStatusStyle(statusId),
        className,
      )}
    >
      {label}
    </Badge>
  );
}
