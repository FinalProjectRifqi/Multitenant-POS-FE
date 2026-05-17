"use client";

import { useMemo, useState } from "react";

import type { StatItem } from "@/components/shared/stats-grid";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { todayInputValue } from "@/lib/inventaris/daily-inventory-utils";
import {
  useDailyPlansQuery,
  useDailyRealizationsQuery,
} from "@/lib/queries/daily-inventory";

import { formatDailyInventoryDate } from "./shared";
import type { DailyInventoryTabCounts, DailyInventoryTabValue } from "./types";

export function useDailyInventoryPage() {
  const currentUser = useCurrentUser();
  const unitId = currentUser?.unit?.unit_id ?? "";
  const [selectedDate, setSelectedDate] = useState(todayInputValue);
  const [activeTab, setActiveTab] =
    useState<DailyInventoryTabValue>("planning");

  const plansQuery = useDailyPlansQuery(unitId, selectedDate);
  const realizationsQuery = useDailyRealizationsQuery(unitId, selectedDate);

  const planCount = (plansQuery.data ?? []).length;
  const realizationCount = (realizationsQuery.data ?? []).length;
  const submittedCount = (realizationsQuery.data ?? []).filter(
    (realization) => realization.status === "SUBMITTED",
  ).length;
  const hasPlan = planCount > 0;
  const allRealizationSubmitted =
    planCount > 0 &&
    realizationCount >= planCount &&
    submittedCount === planCount;
  const completionPct =
    planCount > 0 ? Math.round((submittedCount / planCount) * 100) : 0;
  const isToday = selectedDate === todayInputValue();

  const overviewStats = useMemo<StatItem[]>(
    () => [
      {
        label: "Rencana Bahan",
        value: planCount,
        description: hasPlan ? "Siap untuk realisasi" : "Belum dibuat",
      },
      {
        label: "Realisasi Masuk",
        value: `${submittedCount}/${planCount || 0}`,
        description: allRealizationSubmitted
          ? "Tutup hari selesai"
          : "Masih berjalan",
      },
      {
        label: "Progress Tutup Shift",
        value: `${completionPct}%`,
        description: formatDailyInventoryDate(selectedDate),
      },
    ],
    [
      allRealizationSubmitted,
      completionPct,
      hasPlan,
      planCount,
      selectedDate,
      submittedCount,
    ],
  );

  const tabCounts = useMemo<DailyInventoryTabCounts>(
    () => ({
      planning: planCount,
      realization: submittedCount,
      report: submittedCount,
    }),
    [planCount, submittedCount],
  );

  function handleTabChange(value: string) {
    setActiveTab(value as DailyInventoryTabValue);
  }

  return {
    activeTab,
    handleTabChange,
    isToday,
    overviewStats,
    selectedDate,
    setSelectedDate,
    tabCounts,
    unitId,
  };
}
