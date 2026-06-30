"use client";

import type { OrderDetail, OrderListItem } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

import type { PaymentMethod } from "./order-payment-constants";
import { formatRupiah, getMethodLabel } from "./order-payment-utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ReceiptPreviewProps {
  detail: OrderDetail | undefined;
  source: OrderDetail | OrderListItem;
  method: PaymentMethod;
  reference?: string;
  /** For cash: the amount the customer paid (to show change) */
  paidAmount?: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Separator ─────────────────────────────────────────────────────────────────

function DashedSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative my-5 flex items-center",
        "before:absolute before:inset-0 before:border-t before:border-dashed before:border-border/60",
        className,
      )}
    >
      {/* Decorative dots at both ends */}
      <span className="relative z-10 mr-auto block h-2 w-2 rounded-full bg-border/40" />
      <span className="relative z-10 ml-auto block h-2 w-2 rounded-full bg-border/40" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ReceiptPreview({
  detail,
  source,
  method,
  reference,
  paidAmount,
}: ReceiptPreviewProps) {
  const subtotal =
    detail?.subtotal ?? Math.round((source.total_amount ?? 0) / 1.1);
  const taxAmount = detail?.tax_amount ?? source.total_amount - subtotal;
  const totalAmount = source.total_amount;
  const now = new Date();
  const isCash = method === "cash";
  const hasChange = isCash && paidAmount != null && paidAmount > totalAmount;
  const changeAmount = hasChange ? paidAmount! - totalAmount : 0;

  return (
    <div
      className={cn(
        // Print paper simulation
        "relative mx-auto flex min-h-full w-full max-w-[420px] flex-col",
        "bg-[#FFFCF9] p-0 text-[#1A1412]",
        // Print-only: actual paper size
        "print:max-w-full print:shadow-none print:outline-none",
      )}
    >
      {/* ── Top tear-off perforation guide ── */}
      <div className="flex items-center gap-2 px-6 pt-6 opacity-30 print:hidden">
        <span className="h-px flex-1 bg-border/40" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Receipt
        </span>
        <span className="h-px flex-1 bg-border/40" />
      </div>

      {/* ── Store Header ── */}
      <div className="px-6 pt-5 text-center sm:px-8">
        {/* Brand mark */}
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-sm">
          <span className="text-lg font-black leading-none tracking-tight text-primary-foreground">
            P
          </span>
        </div>

        <h3 className="text-lg font-extrabold tracking-[0.08em] text-[#1A1412]">
          POS KITCHEN
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Jl. Sudirman No. 1
          <br />
          Jakarta Pusat, 10210
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Telp: (021) 555-0100
        </p>
      </div>

      <DashedSeparator />

      {/* ── Metadata Row ── */}
      <div className="px-6 sm:px-8">
        <div className="flex items-baseline justify-between text-[13px]">
          <div className="space-y-1 text-muted-foreground">
            <p className="tracking-wide">{formatDate(now)}</p>
            <p>No. Ref</p>
            {source.table_number && <p>Meja</p>}
          </div>
          <div className="space-y-1 text-right font-semibold">
            <p className="text-primary">{formatTime(now)}</p>
            <p className="font-mono tracking-wider">
              {reference ?? source.order_number}
            </p>
            {source.table_number && (
              <p className="font-bold text-primary">#{source.table_number}</p>
            )}
          </div>
        </div>

        {source.customer_name && (
          <p className="mt-3 text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">Pelanggan:</span>{" "}
            {source.customer_name}
          </p>
        )}

        {detail?.notes && (
          <p className="mt-1 text-[13px] italic text-muted-foreground">
            &ldquo;{detail.notes}&rdquo;
          </p>
        )}
      </div>

      <DashedSeparator />

      {/* ── Items Table ── */}
      <div className="px-6 sm:px-8">
        {/* Table header */}
        <div className="mb-3 grid grid-cols-[40px_minmax(0,1fr)_80px] gap-x-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
          <span className="text-left">Qty</span>
          <span className="text-left">Item</span>
          <span className="text-right">Harga</span>
        </div>

        <div className="space-y-3">
          {detail?.items.map((item, idx) => (
            <div
              key={item.order_item_id}
              className={cn(
                "grid grid-cols-[40px_minmax(0,1fr)_80px] gap-x-2",
                idx > 0 && "border-t border-dashed border-border/30 pt-3",
              )}
            >
              <span className="pt-0.5 text-sm font-bold text-primary">
                {item.quantity}x
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-[#1A1412]">
                  {item.menu_item_name}
                </p>
                {item.notes && (
                  <p className="mt-0.5 truncate text-[12px] italic leading-snug text-muted-foreground/70">
                    {item.notes}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                  @ {formatRupiah(item.item_price)}
                </p>
              </div>
              <span className="pt-0.5 text-right text-sm font-bold tabular-nums text-[#1A1412]">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <DashedSeparator />

      {/* ── Subtotal & Tax ── */}
      <div className="space-y-2 px-6 text-[14px] sm:px-8">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium tabular-nums">
            {formatRupiah(subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pajak (10%)</span>
          <span className="font-medium tabular-nums">
            {formatRupiah(taxAmount)}
          </span>
        </div>
      </div>

      {/* ── Total ── */}
      <div className="mx-6 mt-5 rounded-lg bg-primary/5 px-5 py-4 sm:mx-8">
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-tight text-[#1A1412]">
            TOTAL
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary">
            {formatRupiah(totalAmount)}
          </span>
        </div>
      </div>

      {/* ── Payment Details ── */}
      <div className="mt-5 space-y-2 px-6 text-[14px] sm:px-8">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Metode Bayar</span>
          <span className="flex items-center gap-1.5 font-semibold">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                isCash ? "bg-emerald-500" : "bg-violet-500",
              )}
            />
            {getMethodLabel(method)}
          </span>
        </div>

        {hasChange && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dibayar</span>
              <span className="font-medium tabular-nums">
                {formatRupiah(paidAmount!)}
              </span>
            </div>
            <div className="flex justify-between rounded-md bg-emerald-50 px-3 py-2">
              <span className="font-semibold text-emerald-700">
                Kembalian
              </span>
              <span className="font-bold tabular-nums text-emerald-700">
                {formatRupiah(changeAmount)}
              </span>
            </div>
          </>
        )}
      </div>

      <DashedSeparator />

      {/* ── QR Code Placeholder ── */}
      <div className="flex flex-col items-center gap-3 px-6 sm:px-8">
        <div className="relative grid h-[88px] w-[88px] grid-cols-4 gap-[3px] rounded-xl bg-primary/5 p-[7px] ring-1 ring-primary/10">
          {/* Simulated QR code pattern */}
          {Array.from({ length: 16 }).map((_, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const isCorner =
              (row === 0 && col === 0) ||
              (row === 0 && col === 3) ||
              (row === 3 && col === 0);
            const isFill = isCorner || (row + col) % 2 === 0;

            return (
              <span
                key={index}
                className={cn(
                  "rounded-[2px] transition-colors",
                  isFill ? "bg-primary/70" : "bg-transparent",
                )}
              />
            );
          })}
        </div>
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          Scan untuk struk digital
        </p>
      </div>

      {/* ── Footer ── */}
      <div
        className={cn(
          "mt-auto border-t border-dashed border-border/40",
          "px-6 pb-6 pt-5 text-center sm:px-8",
        )}
      >
        <p className="text-sm font-semibold tracking-tight text-[#1A1412]">
          Terima kasih telah mempercayai kami
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Selamat menikmati hidangan Anda
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          <span>✦</span>
          <span>Struk ini adalah bukti pembayaran sah</span>
          <span>✦</span>
        </div>
      </div>
    </div>
  );
}
