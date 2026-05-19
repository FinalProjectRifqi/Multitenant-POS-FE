"use client";

import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table/data-table";
import type { DailyInventoryRow } from "@/lib/types/analytics";

interface DailyInventorySectionProps {
  data?: DailyInventoryRow[];
  isLoading: boolean;
  date: string;
  onDateChange: (date: string) => void;
}

const dailyInventoryColumns: ColumnDef<DailyInventoryRow, unknown>[] = [
  {
    accessorKey: "inventory_item_name",
    header: "Bahan",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <span className="font-medium">
          {item.inventory_item_name}
          <span className="ml-1 text-xs text-muted-foreground">
            ({item.unit})
          </span>
        </span>
      );
    },
  },
  {
    accessorKey: "planned_usage_qty",
    header: () => <div className="text-right">Rencana</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("planned_usage_qty")}</div>
    ),
  },
  {
    accessorKey: "actual_usage_qty",
    header: () => <div className="text-right">Realisasi</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("actual_usage_qty")}</div>
    ),
  },
  {
    accessorKey: "waste_qty",
    header: () => <div className="text-right">Waste</div>,
    cell: ({ row }) => {
      const waste = row.getValue<number | null>("waste_qty");
      return (
        <div className="text-right">
          {waste !== null && waste > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-red-300 bg-red-50 text-red-700 font-medium">
              {waste}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "variance_qty",
    header: () => <div className="text-right">Variance</div>,
    cell: ({ row }) => {
      const variance = row.getValue<number>("variance_qty");
      return (
        <div className="text-right">
          {variance === 0 ? (
            <span className="text-muted-foreground">0</span>
          ) : variance > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-amber-300 bg-amber-50 text-amber-700 font-medium">
              +{variance}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-red-300 bg-red-50 text-red-700 font-medium">
              {variance}
            </span>
          )}
        </div>
      );
    },
  },
];

export function DailyInventorySection({
  data = [],
  isLoading,
  date,
  onDateChange,
}: DailyInventorySectionProps) {
  return (
    <Card className="bg-primary-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary opacity-70" />
          <h3 className="text-sm font-semibold">
            Penggunaan Inventaris Harian
          </h3>
        </div>
        <div className="relative">
          <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-9 w-40"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <DataTable
          columns={dailyInventoryColumns}
          data={data}
          isLoading={isLoading}
          skeletonRows={5}
          emptyMessage="Tidak ada data inventaris untuk tanggal ini"
          enablePagination={false}
          enableSorting={false}
        />
      </CardContent>
    </Card>
  );
}
