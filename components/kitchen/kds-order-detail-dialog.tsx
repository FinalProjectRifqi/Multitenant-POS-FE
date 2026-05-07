"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarDays, MapPin, UtensilsCrossed, User, X } from "lucide-react";
import type { ElementType } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { KdsStatusBadge } from "@/components/kitchen/kds-status-badge";
import { cn } from "@/lib/utils";
import { KDS_STATUS_META } from "@/lib/kitchen-display/constants";
import type { KdsStatus, OrderEntity } from "@/lib/schemas/order";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

type InfoRowProps = {
  icon: ElementType;
  label: string;
  value: string;
};

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold leading-snug">{value}</p>
      </div>
    </div>
  );
}

type OrderItemRowProps = {
  index: number;
  name: string;
  quantity: number;
  notes?: string | null;
};

function OrderItemRow({ index, name, quantity, notes }: OrderItemRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {quantity}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {notes && (
          <p className="text-xs text-muted-foreground">Catatan: {notes}</p>
        )}
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">#{index + 1}</p>
    </div>
  );
}

type PriceSummaryProps = {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
};

function PriceSummary({ subtotal, taxAmount, totalAmount }: PriceSummaryProps) {
  return (
    <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span>{formatRupiah(subtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Pajak</span>
        <span>{formatRupiah(taxAmount)}</span>
      </div>
      <Separator className="my-1.5" />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatRupiah(totalAmount)}</span>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type KdsOrderDetailDialogProps = {
  order: OrderEntity | null;
  unitName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onActionClick: (order: OrderEntity, nextStatus: KdsStatus) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * KdsOrderDetailDialog
 *
 * Shows full order information when a KDS card is clicked, including:
 *   – Colored header strip keyed to the current status
 *   – Info grid (table, unit, customer, timestamp)
 *   – Optional order-level notes callout
 *   – Full item list with quantity bubbles
 *   – Price summary (subtotal / tax / total)
 *   – Sticky action footer to advance order status
 */
export function KdsOrderDetailDialog({
  order,
  unitName,
  open,
  onOpenChange,
  isPending,
  onActionClick,
}: KdsOrderDetailDialogProps) {
  // Keep Dialog mounted so the close animation plays correctly.
  // All content is conditionally rendered from the order prop.
  const status = order ? (order.kds_status as KdsStatus) : null;
  const meta = status ? KDS_STATUS_META[status] : null;

  const formattedOrderedAt = order
    ? format(new Date(order.ordered_at), "dd MMM yyyy, HH:mm", {
        locale: localeId,
      })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        {order && status && meta && (
          <>
            {/* Colored header strip based on status */}
            <div
              className={cn(
                "flex items-center justify-between gap-3 px-5 py-4",
                meta.headerBgClass,
              )}
            >
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-lg font-bold leading-none">
                  {order.order_number}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {order.order_type}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <KdsStatusBadge status={status} />
                <Button
                  aria-label="Tutup"
                  onClick={() => onOpenChange(false)}
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-md opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow
                    icon={MapPin}
                    label="Nomor Meja"
                    value={order.table_number}
                  />
                  <InfoRow
                    icon={UtensilsCrossed}
                    label="Tipe Order"
                    value={order.order_type}
                  />
                  <InfoRow
                    icon={User}
                    label="Nama Pelanggan"
                    value={order.customer_name}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Waktu Order"
                    value={formattedOrderedAt}
                  />
                </div>

                {/* Order-level notes (optional) */}
                {order.notes && (
                  <div className="rounded-lg border bg-primary px-3 py-2">
                    <p className="text-xs font-medium text-primary-foreground">
                      Catatan Pesanan
                    </p>
                    <p className="mt-0.5 text-sm text-primary-foreground">
                      {order.notes}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Detail Pesanan</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {order.items.length} item
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <OrderItemRow
                        key={item.order_item_id}
                        index={idx}
                        name={item.menu_item_name}
                        quantity={item.quantity}
                        notes={item.notes}
                      />
                    ))}
                  </div>
                </div>

                {/* Price summary */}
                <PriceSummary
                  subtotal={order.subtotal}
                  taxAmount={order.tax_amount}
                  totalAmount={order.total_amount}
                />
              </div>
            </div>

            {/* Sticky action footer */}
            {meta.actionLabel && meta.nextStatus && (
              <div className="border-t border-border bg-background px-5 py-3">
                <Button
                  className="w-full"
                  disabled={isPending}
                  onClick={() => onActionClick(order, meta.nextStatus!)}
                >
                  {isPending ? "Memproses…" : meta.actionLabel}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
