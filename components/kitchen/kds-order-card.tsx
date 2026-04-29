"use client";

import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KdsStatusBadge } from "@/components/kitchen/kds-status-badge";
import { cn } from "@/lib/utils";
import { KDS_STATUS_META } from "@/lib/kitchen-display/constants";
import type { KdsStatus, OrderEntity } from "@/lib/schemas/order";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum items shown inline on the card; the rest are surfaced in the dialog. */
const MAX_VISIBLE_ITEMS = 3;

// ── Types ─────────────────────────────────────────────────────────────────────

export type KdsOrderCardProps = {
  order: OrderEntity;
  /** True only while this specific card's status mutation is in-flight. */
  isPending: boolean;
  onActionClick: (order: OrderEntity, nextStatus: KdsStatus) => void;
  onCardClick: (order: OrderEntity) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function KdsOrderCard({
  order,
  isPending,
  onActionClick,
  onCardClick,
}: KdsOrderCardProps) {
  const status = order.kds_status as KdsStatus;
  const meta = KDS_STATUS_META[status];

  const visibleItems = order.items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = order.items.length - MAX_VISIBLE_ITEMS;

  const elapsed = formatDistanceToNow(new Date(order.ordered_at), {
    addSuffix: true,
    locale: localeId,
  });

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-primary-foreground shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:border-primary/30",
      )}
    >
      {/* Thin status accent stripe */}
      <div className={cn("h-1 w-full", meta.accentClass)} />

      {/* Clickable body — opens detail dialog */}
      <button
        className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        onClick={() => onCardClick(order)}
        aria-label={`Lihat detail ${order.order_number}`}
      >
        {/* Header: order number + table + badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-bold tracking-tight text-foreground">
              {order.order_number}
            </p>
            <p className="text-xs text-muted-foreground">{order.table_number}</p>
          </div>
          <KdsStatusBadge status={status} />
        </div>

        {/* Customer name + elapsed time */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {order.customer_name}
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            {elapsed}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border/60" />

        {/* Order items (truncated) */}
        <div className="space-y-2">
          {visibleItems.map((item) => (
            <div key={item.order_item_id} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {item.quantity}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-snug text-foreground">
                  {item.menu_item_name}
                </p>
                {item.notes && (
                  <p className="text-xs text-muted-foreground">
                    Catatan: {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
          {hiddenCount > 0 && (
            <p className="pl-7 text-xs italic text-muted-foreground">
              +{hiddenCount} item lainnya…
            </p>
          )}
        </div>
      </button>

      {/* Action button — separated by border, hidden for final status */}
      {meta.actionLabel && meta.nextStatus ? (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <Button
            className="w-full"
            disabled={isPending}
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(order, meta.nextStatus!);
            }}
          >
            {isPending ? "Memproses…" : meta.actionLabel}
          </Button>
        </div>
      ) : (
        /* Spacer keeps cards the same height when no action button is rendered */
        <div className="pb-4" />
      )}
    </div>
  );
}
