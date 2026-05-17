"use client";

import { AlertCircle, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import { RealizationStatusBadge } from "@/components/inventaris/realization-status-badge";
import { VarianceBadge } from "@/components/inventaris/variance-badge";
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api/client";
import { useDailyUsageReportQuery } from "@/lib/queries/daily-inventory";
import { useInventarisItemsQuery } from "@/lib/queries/inventaris";
import type { DailyUsageReportItem } from "@/lib/schemas/daily-inventory";

import {
  DAILY_INVENTORY_CARD_CLASS,
  DAILY_INVENTORY_TABLE_FRAME_CLASS,
  DAILY_INVENTORY_TABLE_HEADER_ROW_CLASS,
  formatDailyInventoryDate,
  INVENTORY_LIST_LIMIT,
  TableSkeleton,
} from "./shared";

type ReportTabProps = {
  unitId: string;
  selectedDate: string;
};

type ReportTotals = {
  actual: number;
  planned: number;
  variance: number;
};

export function ReportTab({ unitId, selectedDate }: ReportTabProps) {
  const reportQuery = useDailyUsageReportQuery(unitId, selectedDate);
  const inventoryQuery = useInventarisItemsQuery(unitId, {
    limit: INVENTORY_LIST_LIMIT,
  });
  const reportItems = useMemo(() => reportQuery.data ?? [], [reportQuery.data]);

  const currentStockByItemId = useMemo(() => {
    const stocks = new Map<string, number>();

    for (const item of inventoryQuery.data?.data ?? []) {
      stocks.set(item.inventory_item_id, item.current_stock);
    }

    return stocks;
  }, [inventoryQuery.data?.data]);

  const totals = useMemo(
    () => ({
      planned: reportItems.reduce(
        (sum, item) => sum + item.planned_usage_qty,
        0,
      ),
      actual: reportItems.reduce((sum, item) => sum + item.actual_usage_qty, 0),
      variance: reportItems.reduce((sum, item) => sum + item.variance_qty, 0),
    }),
    [reportItems],
  );

  return (
    <div className="space-y-4">
      {reportQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal memuat laporan</AlertTitle>
          <AlertDescription>
            {getErrorMessage(reportQuery.error)}
          </AlertDescription>
        </Alert>
      )}

      {inventoryQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal memuat stok saat ini</AlertTitle>
          <AlertDescription>
            {getErrorMessage(inventoryQuery.error)}
          </AlertDescription>
        </Alert>
      )}

      {!reportQuery.isLoading && reportItems.length > 0 && (
        <StatsGrid
          columns={4}
          stats={buildReportStats(reportItems.length, totals)}
        />
      )}

      <Card className={DAILY_INVENTORY_CARD_CLASS}>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">
            Laporan Penggunaan Harian
          </CardTitle>
          <CardDescription className="mt-1">
            {formatDailyInventoryDate(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={DAILY_INVENTORY_TABLE_FRAME_CLASS}>
            <Table>
              <TableHeader>
                <TableRow className={DAILY_INVENTORY_TABLE_HEADER_ROW_CLASS}>
                  <TableHead className="min-w-44">Nama Bahan</TableHead>
                  <TableHead className="w-20">Satuan</TableHead>
                  <TableHead className="w-28 text-right">
                    Stok Saat Ini
                  </TableHead>
                  <TableHead className="w-24 text-right">Rencana</TableHead>
                  <TableHead className="w-24 text-right">Aktual</TableHead>
                  <TableHead className="w-20 text-right">Waste</TableHead>
                  <TableHead className="w-28 text-center">Variance</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="min-w-36">Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportQuery.isLoading ? (
                  <TableSkeleton cols={9} rows={3} />
                ) : reportItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-36 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-9 w-9 opacity-30" />
                        <p className="text-sm font-medium">Belum ada laporan</p>
                        <p className="text-xs">
                          Laporan muncul setelah realisasi disubmit.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reportItems.map((item) => (
                    <ReportRow
                      key={item.inventory_item_id}
                      item={item}
                      currentStock={
                        item.current_stock ??
                        currentStockByItemId.get(item.inventory_item_id)
                      }
                      isStockLoading={
                        inventoryQuery.isLoading && item.current_stock == null
                      }
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildReportStats(
  totalItems: number,
  totals: ReportTotals,
): StatItem[] {
  return [
    {
      label: "Total Bahan",
      value: totalItems,
      description: "Bahan yang masuk laporan",
    },
    {
      label: "Total Rencana",
      value: totals.planned,
      description: "Jumlah penggunaan direncanakan",
    },
    {
      label: "Total Aktual",
      value: totals.actual,
      description: "Jumlah penggunaan sebenarnya",
    },
    {
      label: "Total Variance",
      value: totals.variance > 0 ? `+${totals.variance}` : totals.variance,
      description:
        totals.variance < 0
          ? "Pemakaian melebihi rencana"
          : "Sisa dari rencana",
    },
  ];
}

function ReportRow({
  item,
  currentStock,
  isStockLoading,
}: {
  item: DailyUsageReportItem;
  currentStock: number | undefined;
  isStockLoading: boolean;
}) {
  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell className="font-medium">{item.inventory_item_name}</TableCell>
      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
      <TableCell className="text-right tabular-nums">
        {isStockLoading ? "..." : (currentStock ?? "-")}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {item.planned_usage_qty}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {item.actual_usage_qty}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {item.waste_qty}
      </TableCell>
      <TableCell className="text-center">
        <VarianceBadge variance={item.variance_qty} />
      </TableCell>
      <TableCell>
        <RealizationStatusBadge status={item.status} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {item.notes ?? "-"}
      </TableCell>
    </TableRow>
  );
}
