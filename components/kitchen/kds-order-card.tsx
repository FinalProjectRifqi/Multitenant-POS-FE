"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { KdsStatusBadge } from "@/components/kitchen/kds-status-badge";
import { cn } from "@/lib/utils";
import { KDS_STATUS_META } from "@/lib/kitchen-display/constants";
import { ORDER_STATUS } from "@/lib/orders/constants";
import type { OrderListItem } from "@/lib/orders/types";
import {
  useCancelOrderStatusMutation,
  usePosOrderDetailQuery,
  useTransitionOrderStatusMutation,
} from "@/lib/queries/pos-orders";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum items shown inline on the card; the rest are surfaced in the dialog. */
const MAX_VISIBLE_ITEMS = 3;

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type KdsOrderCardProps = {
  unitId: string;
  order: OrderListItem;
  onCardClick: (order: OrderListItem) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function KdsOrderCard({
  unitId,
  order,
  onCardClick,
}: KdsOrderCardProps) {
  const statusId = order.order_status_id;
  const meta = KDS_STATUS_META[statusId];
  const nextStatusId =
    statusId === ORDER_STATUS.JUST_IN
      ? ORDER_STATUS.ON_PROCESS
      : statusId === ORDER_STATUS.ON_PROCESS
        ? ORDER_STATUS.READY
        : null;
  const canCancel = statusId === ORDER_STATUS.JUST_IN;

  const detailQuery = usePosOrderDetailQuery(unitId, order.order_id);
  const transitionMutation = useTransitionOrderStatusMutation(
    unitId,
    order.order_id,
  );
  const cancelMutation = useCancelOrderStatusMutation(unitId);
  const isMutating = transitionMutation.isPending || cancelMutation.isPending;
  const items = detailQuery.data?.data.items ?? [];
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = Math.max(0, items.length - MAX_VISIBLE_ITEMS);
  const itemsCount = detailQuery.isLoading ? null : items.length;

  const orderedAt = format(new Date(order.ordered_at), "dd MMM, HH:mm", {
    locale: localeId,
  });

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-[#F1EEE9] shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:border-primary/30",
      )}
    >
      {/* Thin status accent stripe */}
      <div className={cn("h-1 w-full", meta?.accentClass ?? "bg-muted")} />

      {/* Clickable body — opens detail dialog */}
      <Button
        type="button"
        variant="ghost"
        className={cn(
          // Button base styles set `items-center justify-center` — override for a clean card layout.
          "flex flex-1 flex-col items-stretch justify-start gap-3 rounded-none px-4 py-4 text-left bg-[#FAF8F6]",
          "hover:bg-[#FAF8F6]/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
        onClick={() => onCardClick(order)}
        aria-label={`Lihat detail ${order.order_number}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {order.customer_name || "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {order.order_number}
            </p>
          </div>
          <KdsStatusBadge
            statusId={statusId}
            fallbackLabel={order.order_status_name}
            className="h-6"
          />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-3">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {orderedAt}
            </p>
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {order.table_number ? `Meja ${order.table_number}` : "Tanpa meja"}{" "}
              · {order.order_type_name}
            </p>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="h-px w-full border-t border-dashed border-border/80" />

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/90">
              Order ({itemsCount === null ? "…" : itemsCount})
            </p>
          </div>

          {detailQuery.isLoading ? (
            <>
              <div className="h-4 w-4/5 rounded bg-muted/60" />
              <div className="h-4 w-3/5 rounded bg-muted/60" />
            </>
          ) : visibleItems.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">
              Tidak ada item.
            </p>
          ) : (
            <>
              {visibleItems.map((item) => (
                <div
                  key={item.order_item_id}
                  className="flex items-center gap-2"
                >
                  <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-semibold text-muted-foreground">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-wrap text-xs font-medium leading-snug text-foreground">
                      {item.menu_item_name}
                    </p>
                    {item.notes && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {hiddenCount > 0 && (
                <p className="text-xs italic text-muted-foreground">
                  +{hiddenCount} item lainnya…
                </p>
              )}
            </>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-border/60 pt-2">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-semibold text-emerald-600">
            {formatRupiah(order.total_amount)}
          </p>
        </div>
      </Button>

      {(nextStatusId || canCancel) && (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 bg-[#F1EEE9] px-4 py-3">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={!canCancel || isMutating}
            onClick={() => {
              if (!canCancel) return;
              void cancelMutation.cancelOrderStatus(order.order_id);
            }}
          >
            {cancelMutation.isPending ? "Membatalkan..." : "Batalkan"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/80"
            disabled={!nextStatusId || isMutating}
            onClick={() => {
              if (!nextStatusId) return;
              void transitionMutation.transitionStatus(nextStatusId);
            }}
          >
            {transitionMutation.isPending
              ? "Memperbarui..."
              : nextStatusId === ORDER_STATUS.ON_PROCESS
                ? "Proses"
                : "Siap Disajikan"}
          </Button>
        </div>
      )}
    </div>
  );
}
