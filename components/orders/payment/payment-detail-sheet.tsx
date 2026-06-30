import { Banknote, Loader2, Printer, ReceiptText } from "lucide-react";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import type { OrderDetail, OrderListItem } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

import { PAYMENT_METHODS, type PaymentMethod } from "./order-payment-constants";
import { formatRupiah, getOrderPlace } from "./order-payment-utils";
import { printReceipt } from "./receipt-print";

interface PaymentDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: OrderDetail | OrderListItem | null;
  detail: OrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  totalQty: number;
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  isCashAllowed: boolean;
  isRoleReady: boolean;
  canPayStatus: boolean;
  isPending: boolean;
  onProcess: () => void;
}

export function PaymentDetailSheet({
  open,
  onOpenChange,
  source,
  detail,
  isLoading,
  isError,
  subtotal,
  taxAmount,
  totalAmount,
  totalQty,
  method,
  onMethodChange,
  isCashAllowed,
  isRoleReady,
  canPayStatus,
  isPending,
  onProcess,
}: PaymentDetailSheetProps) {
  const selectedMethod = PAYMENT_METHODS.find((item) => item.id === method);
  const SelectedMethodIcon = selectedMethod?.icon ?? Banknote;
  const isCashRestricted = isRoleReady && !isCashAllowed;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-dvh w-full flex-col p-0 sm:h-auto sm:max-w-xl">
        <SheetHeader className="border-b border-border p-6 pr-14">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl font-bold">
                  {source?.order_number ?? "Detail Pesanan"}
                </SheetTitle>
                {source && (
                  <OrderStatusBadge
                    statusId={source.order_status_id}
                    statusName={source.order_status_name}
                  />
                )}
              </div>
              <SheetDescription>
                {source
                  ? `${source.customer_name} - ${getOrderPlace(source)}`
                  : "Memuat detail pesanan..."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex min-h-60 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memuat detail pesanan...
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Gagal memuat detail pesanan.
            </div>
          ) : source ? (
            <div className="space-y-6">
              <section className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Item Pesanan
                </Label>
                <div className="space-y-2">
                  {detail?.items.map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex items-center justify-between gap-4 rounded-lg bg-muted/60 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-xs font-bold text-primary">
                          {item.quantity}x
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.menu_item_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRupiah(item.item_price)} / item
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-bold">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-border">
                <div className="bg-muted/60 px-4 py-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Ringkasan Tagihan
                  </Label>
                </div>
                <div className="space-y-3 px-4 py-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal{totalQty ? ` (${totalQty} item)` : ""}
                    </span>
                    <span className="font-medium">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pajak (10%)</span>
                    <span className="font-medium">
                      {formatRupiah(taxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-extrabold text-primary">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Metode Bayar
                </Label>
                <div className="grid gap-3">
                  {PAYMENT_METHODS.map(
                    ({ id, label, description, icon: Icon }) => {
                      const isDisabled = id === "cash" && isCashRestricted;

                      return (
                        <button
                          key={id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            onMethodChange(id);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                            method === id
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/40",
                            isDisabled && "cursor-not-allowed opacity-50",
                          )}
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold">
                              {label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {description}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              method === id ? "bg-primary" : "bg-transparent",
                            )}
                          />
                        </button>
                      );
                    },
                  )}
                </div>
                {isCashRestricted && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Pembayaran tunai hanya untuk Staf Unit.
                  </div>
                )}
              </section>

              {!canPayStatus && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Pembayaran hanya bisa diproses untuk pesanan berstatus siap.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <SheetFooter className="grid grid-cols-2 gap-3 border-t border-border bg-background p-6 max-sm:grid-cols-1">
          <Button
            type="button"
            variant="outline"
            className="h-12"
            onClick={() => {
              if (!source) return;
              printReceipt({
                detail,
                source,
                method,
              });
            }}
          >
            <Printer className="h-4 w-4" />
            Cetak Struk
          </Button>
          <Button
            type="button"
            className="h-12"
            disabled={!source || !canPayStatus || isPending}
            onClick={onProcess}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SelectedMethodIcon className="h-4 w-4" />
            )}
            Proses Bayar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
