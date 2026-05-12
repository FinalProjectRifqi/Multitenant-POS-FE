"use client";

import { cn } from "@/lib/utils";
import {
  KDS_FILTER_TABS,
  type KdsFilterValue,
} from "@/lib/kitchen-display/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Props ─────────────────────────────────────────────────────────────────────

export type KdsFilterTabsProps = {
  active: KdsFilterValue;
  counts: Record<string, number>;
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
export function KdsFilterTabs({
  active,
  counts,
  onChange,
}: KdsFilterTabsProps) {
  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <Tabs value={active} onValueChange={(v) => onChange(v as KdsFilterValue)}>
      <TabsList className="h-12 bg-[#FAF8F6]">
        {KDS_FILTER_TABS.map((tab) => {
          const count =
            tab.value === "all" ? allCount : (counts[String(tab.value)] ?? 0);
          const isActive = active === tab.value;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs data-[state=inactive]:text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-muted data-[state=active]:shadow-sm"
            >
              <span className="mr-2">{tab.label}</span>
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  isActive
                    ? "bg-muted/25 text-muted"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
