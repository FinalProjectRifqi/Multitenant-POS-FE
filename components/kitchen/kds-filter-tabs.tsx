"use client";

import { cn } from "@/lib/utils";
import {
  KDS_FILTER_TABS,
  type KdsFilterValue,
} from "@/lib/kitchen-display/constants";
import type { KdsStatus } from "@/lib/schemas/order";

// ── Props ─────────────────────────────────────────────────────────────────────

export type KdsFilterTabsProps = {
  active: KdsFilterValue;
  counts: Record<KdsStatus, number>;
  onChange: (value: KdsFilterValue) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * KdsFilterTabs
 *
 * Pill-style tab bar to filter the KDS order grid by status.
 * Tab definitions and labels come from KDS_FILTER_TABS (constants.ts) so there
 * is a single source of truth for status labels across the whole module.
 */
export function KdsFilterTabs({ active, counts, onChange }: KdsFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter status pesanan"
      className="flex flex-wrap gap-2"
    >
      {KDS_FILTER_TABS.map((tab) => {
        const count = tab.value !== "all" ? counts[tab.value as KdsStatus] : null;
        const isActive = active === tab.value;

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
            )}
          >
            {tab.label}
            {count !== null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
