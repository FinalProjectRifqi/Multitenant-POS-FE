"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RealizationStatus = "NOT_PLANNED" | "PLANNED" | "DRAFT" | "SUBMITTED";

const STATUS_CONFIG: Record<RealizationStatus, { label: string; className: string }> = {
  NOT_PLANNED: {
    label: "Belum Direncanakan",
    className: "border-gray-300 bg-gray-50 text-gray-500",
  },
  PLANNED: {
    label: "Direncanakan",
    className: "border-blue-400 bg-blue-50 text-blue-700",
  },
  DRAFT: {
    label: "Draft",
    className: "border-yellow-400 bg-yellow-50 text-yellow-700",
  },
  SUBMITTED: {
    label: "Tersubmit",
    className: "border-green-500 bg-green-50 text-green-700",
  },
};

type RealizationStatusBadgeProps = {
  status: RealizationStatus;
  className?: string;
};

export function RealizationStatusBadge({ status, className }: RealizationStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
