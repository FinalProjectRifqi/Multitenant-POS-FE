"use client";

import { PageHeader } from "@/components/dashboard/ui";
import { DailyInventoryDateControl } from "@/components/inventaris/daily-inventory/date-control";
import { DailyInventoryTabsList } from "@/components/inventaris/daily-inventory/daily-inventory-tabs";
import { PlanningTab } from "@/components/inventaris/daily-inventory/planning-tab";
import { RealizationTab } from "@/components/inventaris/daily-inventory/realization-tab";
import { ReportTab } from "@/components/inventaris/daily-inventory/report-tab";
import { useDailyInventoryPage } from "@/components/inventaris/daily-inventory/use-daily-inventory-page";
import { StatsGrid } from "@/components/shared/stats-grid";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export function DailyInventoryPlanningPage() {
  const page = useDailyInventoryPage();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <section>
        <PageHeader
          title="Inventaris Harian"
          description="Catat rencana penggunaan bahan di awal hari, lalu submit realisasi di akhir hari."
        />
      </section>

      <StatsGrid
        columns={3}
        stats={page.overviewStats}
      />

      <Tabs
        value={page.activeTab}
        onValueChange={page.handleTabChange}
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <DailyInventoryTabsList
            active={page.activeTab}
            counts={page.tabCounts}
          />

          <DailyInventoryDateControl
            selectedDate={page.selectedDate}
            isToday={page.isToday}
            onDateChange={page.setSelectedDate}
          />
        </div>

        <TabsContent value="planning" className="mt-0">
          <PlanningTab unitId={page.unitId} selectedDate={page.selectedDate} />
        </TabsContent>

        <TabsContent value="realization" className="mt-0">
          <RealizationTab
            unitId={page.unitId}
            selectedDate={page.selectedDate}
          />
        </TabsContent>

        <TabsContent value="report" className="mt-0">
          <ReportTab unitId={page.unitId} selectedDate={page.selectedDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
