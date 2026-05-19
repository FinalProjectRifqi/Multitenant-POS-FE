"use client";

import { TriangleAlert, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AnalyticsInventoryStatusData,
  InventoryStatusRow,
} from "@/lib/types/analytics";

function StatusBadge({ status }: { status: InventoryStatusRow["status"] }) {
  const map: Record<string, string> = {
    CRITICAL: "border-red-300 bg-red-50 text-red-700",
    LOW: "border-amber-300 bg-amber-50 text-amber-700",
    OUT: "border-gray-300 bg-gray-50 text-gray-600",
  };
  const label: Record<string, string> = {
    CRITICAL: "Kritis",
    LOW: "Rendah",
    OUT: "Habis",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${
        map[status] ?? "border-border bg-muted text-muted-foreground"
      }`}
    >
      {label[status] ?? status}
    </span>
  );
}

const borderColor: Record<string, string> = {
  CRITICAL: "border-l-red-400",
  LOW: "border-l-amber-400",
  OUT: "border-l-gray-400",
};

function InventoryItem({ item }: { item: InventoryStatusRow }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border border-l-4 px-4 py-3 bg-white ${
        borderColor[item.status] ?? "border-l-border"
      }`}
    >
      <div>
        <p className="text-sm font-medium text-foreground">
          {item.inventory_item_name}
        </p>
        <p className="text-xs text-muted-foreground">
          Min {item.min_threshold} {item.unit_of_measure}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">
          {item.current_stock} {item.unit_of_measure}
        </span>
        <StatusBadge status={item.status} />
      </div>
    </div>
  );
}

export function InventoryStatusSection({
  data,
  isLoading,
}: {
  data?: AnalyticsInventoryStatusData;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-40" />
            {[0, 1, 2].map((j) => (
              <Skeleton key={j} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const low = data?.low_or_critical ?? [];
  const out = data?.out_of_stock ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Stok Rendah / Kritis */}
      <div className="rounded-xl border p-5 space-y-3 bg-primary-foreground">
        <div className="flex items-center gap-2 border-l-4 border-l-amber-500 pl-3">
          <TriangleAlert className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-base">Stok Rendah / Kritis</h3>
        </div>
        {low.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Semua stok aman
          </p>
        ) : (
          <div className="space-y-2">
            {low.map((item) => (
              <InventoryItem key={item.inventory_item_id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Stok Habis */}
      <div className="rounded-xl border p-5 space-y-3 bg-primary-foreground">
        <div className="flex items-center gap-2 border-l-4 border-l-red-500 pl-3">
          <Package className="h-4 w-4 text-red-500" />
          <h3 className="font-semibold text-base">Stok Habis</h3>
        </div>
        {out.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Tidak ada stok habis
          </p>
        ) : (
          <div className="space-y-2">
            {out.map((item) => (
              <InventoryItem key={item.inventory_item_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
