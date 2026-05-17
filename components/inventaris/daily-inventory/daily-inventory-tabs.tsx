"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { DailyInventoryTabCounts, DailyInventoryTabValue } from "./types";

const DAILY_INVENTORY_TABS: {
  value: DailyInventoryTabValue;
  label: string;
}[] = [
  { value: "planning", label: "Perencanaan" },
  { value: "realization", label: "Realisasi" },
  { value: "report", label: "Laporan" },
];

type DailyInventoryTabsListProps = {
  active: DailyInventoryTabValue;
  counts: DailyInventoryTabCounts;
};

export function DailyInventoryTabsList({
  active,
  counts,
}: DailyInventoryTabsListProps) {
  return (
    <TabsList className="h-12 bg-[#FAF8F6]">
      {DAILY_INVENTORY_TABS.map((tab) => {
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
              {counts[tab.value]}
            </span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
