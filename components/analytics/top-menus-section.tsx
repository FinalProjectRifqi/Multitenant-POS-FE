"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table/data-table";
import type { TopMenuRow } from "@/lib/types/analytics";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatRupiahShort(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${value}`;
}

const RANK_STYLES = [
  "bg-amber-400 text-white",
  "bg-gray-300 text-gray-700",
  "bg-orange-400 text-white",
];

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank - 1] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold leading-none ${style}`}
    >
      {rank}
    </span>
  );
}

// ──────────────────────────────────────────────────────────
// MenuRevenueList: "Pendapatan per Menu" — list with progress bars
// Used in the sidebar next to the Trend chart
// ──────────────────────────────────────────────────────────
interface MenuRevenueListProps {
  data?: TopMenuRow[];
  isLoading: boolean;
}

export function MenuRevenueList({
  data = [],
  isLoading,
}: MenuRevenueListProps) {
  const maxRevenue =
    data.length > 0 ? Math.max(...data.map((r) => r.pendapatan)) : 1;
  const displayData = data.slice(0, 6);

  return (
    <Card className="h-full bg-primary-foreground">
      <CardHeader className="px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary opacity-70" />
          <h3 className="text-lg font-semibold leading-none">
            Pendapatan per Menu
          </h3>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : displayData.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-muted-foreground">
            Belum ada data
          </p>
        ) : (
          <div className="space-y-4">
            {displayData.map((row, index) => {
              const pct =
                maxRevenue > 0 ? (row.pendapatan / maxRevenue) * 100 : 0;
              return (
                <div key={row.menu_item_id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <RankBadge rank={index + 1} />
                      <span className="truncate text-sm font-semibold text-foreground">
                        {row.menu_item_name}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                      {formatRupiahShort(row.pendapatan)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary opacity-70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────
// TopMenusSection: Full-width ranked table "Menu Terlaris"
// ──────────────────────────────────────────────────────────
interface TopMenusSectionProps {
  data?: TopMenuRow[];
  isLoading: boolean;
}

export function TopMenusSection({
  data = [],
  isLoading,
}: TopMenusSectionProps) {
  const topMenuColumns: ColumnDef<TopMenuRow, unknown>[] = [
    {
      id: "rank",
      header: "#",
      cell: ({ row }) => <RankBadge rank={row.index + 1} />,
      enableSorting: false,
    },
    {
      accessorKey: "menu_item_name",
      header: "Menu",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.getValue("menu_item_name")}
        </span>
      ),
    },
    {
      accessorKey: "category_name",
      header: "Kategori",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-muted-foreground">
          {row.getValue("category_name")}
        </span>
      ),
    },
    {
      accessorKey: "qty_terjual",
      header: () => <div className="text-right">Qty Terjual</div>,
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.getValue("qty_terjual")}
        </div>
      ),
    },
    {
      accessorKey: "pendapatan",
      header: () => <div className="text-right">Pendapatan</div>,
      cell: ({ row }) => (
        <div className="text-left font-semibold">
          {formatRupiah(row.getValue("pendapatan"))}
        </div>
      ),
    },
  ];

  return (
    <Card className="bg-primary-foreground">
      <CardHeader className="px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary opacity-70" />
          <h3 className="text-lg font-semibold leading-none">Menu Terlaris</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <DataTable
          columns={topMenuColumns}
          data={data}
          isLoading={isLoading}
          skeletonRows={5}
          emptyMessage="Belum ada data"
          enablePagination={false}
          enableSorting={false}
        />
      </CardContent>
    </Card>
  );
}
