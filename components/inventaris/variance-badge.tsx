"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VarianceBadgeProps = {
  variance: number;
  className?: string;
};

/**
 * Displays inventory variance with colour coding:
 * - Positive (under usage) → green
 * - Zero (as planned) → gray
 * - Negative (over usage) → red
 */
export function VarianceBadge({ variance, className }: VarianceBadgeProps) {
  if (variance > 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-green-500 bg-green-50 text-green-700 font-mono tabular-nums",
          className,
        )}
      >
        +{variance}
      </Badge>
    );
  }
  if (variance < 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-red-500 bg-red-50 text-red-700 font-mono tabular-nums",
          className,
        )}
      >
        {variance}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-gray-400 bg-gray-50 text-gray-600 font-mono tabular-nums",
        className,
      )}
    >
      0
    </Badge>
  );
}
