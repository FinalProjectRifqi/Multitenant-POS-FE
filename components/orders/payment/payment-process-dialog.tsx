import {
  Banknote,
  CheckCircle2,
  Loader2,
  ReceiptText,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderDetail, OrderListItem } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

import { PAYMENT_METHODS, type PaymentMethod } from "./order-payment-constants";
import {
  formatInputAmount,
  formatRupiah,
  parseInputAmount,
} from "./order-payment-utils";

interface PaymentProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: OrderDetail | OrderListItem | null;
  detail: OrderDetail | undefined;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  totalQty: number;
  method: PaymentMethod;
  cashReceived: number;
  onCashReceivedChange: (value: number) => void;
  quickAmounts: number[];
  change: number;
  isCashAllowed: boolean;
  isRoleReady: boolean;
  canConfirm: boolean;
  isPending: boolean;
  onConfirm: () => void;
}

export function PaymentProcessDialog({
  open,
  onOpenChange,
  source,
  detail,
  totalAmount,
  subtotal,
  taxAmount,
  totalQty,
  method,
  cashReceived,
  onCashReceivedChange,
  quickAmounts,
  change,
  isCashAllowed,
  isRoleReady,
  canConfirm,
  isPending,
  onConfirm,
}: PaymentProcessDialogProps) {
  const selectedMethod = PAYMENT_METHODS.find((item) => item.id === method);
  const SelectedMethodIcon = selectedMethod?.icon ?? Banknote;
  const isCash = method === "cash";
  const isCashRestricted = isRoleReady && !isCashAllowed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-dvh w-full flex-col overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[95dvh] sm:w-[min(94vw,1160px)] sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-14 sm:px-8 sm:py-6 sm:pr-16">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold">
                Proses Pembayaran
              </DialogTitle>
              <DialogDescription>
                {source
                  ? `${source.order_number} - ${totalQty || detail?.items.length || 0} item`
                  : "Memuat detail pesanan..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {source && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid md:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="border-b border-border bg-[#FAF8F6] px-5 py-5 sm:px-6 sm:py-7 md:border-b-0 md:border-r">
                <section className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Ringkasan Pesanan
                  </Label>
                  <div className="space-y-3">
                    {detail?.items.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 gap-y-1">
                          <span className="font-bold text-primary">
                            {item.quantity}x
                          </span>
                          <span className="min-w-0 font-semibold leading-5">
                            {item.menu_item_name}
                          </span>
                          {item.notes && (
                            <p className="col-span-2 text-sm leading-5 text-foreground">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-right font-bold">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="my-5 h-px bg-border" />

                <section className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Pajak (10%)</span>
                    <span className="font-medium text-foreground">
                      {formatRupiah(taxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-md">
                    <span>Total</span>
                    <span className="text-right text-lg font-extrabold">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>
                </section>

                <section className="mt-6 space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Metode Bayar
                  </Label>
                  <div className="rounded-lg border border-primary bg-primary/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SelectedMethodIcon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-bold">
                          {selectedMethod?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedMethod?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>

              <main className="bg-[#FFFCF9] px-5 py-5 sm:px-8 sm:py-7">
                <div className="mb-7 flex items-center gap-3">
                  <SelectedMethodIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">
                    {isCash
                      ? "Pembayaran Tunai"
                      : `Pembayaran ${selectedMethod?.label ?? "Cashless"}`}
                  </h3>
                </div>

                <div className="rounded-xl bg-primary px-5 py-6 text-primary-foreground shadow-sm sm:px-7">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                    Yang Harus Dibayar
                  </p>
                  <p className="mt-3 wrap-break-word text-[clamp(2.25rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
                    {formatRupiah(totalAmount)}
                  </p>
                </div>

                {isCash ? (
                  <div className="mt-7 space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="cash-received"
                        className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        Uang Diterima
                      </Label>
                      <div className="flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-border bg-[#F4F0EC] px-4 py-3 focus-within:border-primary sm:px-5">
                        <span className="text-[clamp(1.125rem,2.2vw,1.5rem)] font-semibold text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          id="cash-received"
                          inputMode="numeric"
                          value={formatInputAmount(cashReceived)}
                          onChange={(event) =>
                            onCashReceivedChange(
                              parseInputAmount(event.target.value),
                            )
                          }
                          placeholder="0"
                          className="h-12 min-w-0 border-0 bg-transparent px-0 text-3xl md:text-3xl font-extrabold leading-none shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>

                    {isCashRestricted && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Pembayaran tunai hanya untuk Staf Unit.
                      </div>
                    )}

                    <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={
                            cashReceived === amount ? "default" : "outline"
                          }
                          title={
                            amount === totalAmount
                              ? "Pas"
                              : formatRupiah(amount)
                          }
                          className="h-11 min-w-0 rounded-lg px-2 text-sm"
                          onClick={() => onCashReceivedChange(amount)}
                        >
                          <span className="min-w-0 truncate">
                            {amount === totalAmount
                              ? "Pas"
                              : formatRupiah(amount)}
                          </span>
                        </Button>
                      ))}
                    </div>

                    {cashReceived > 0 && (
                      <div
                        className={cn(
                          "flex min-w-0 items-center gap-4 rounded-xl border px-5 py-5 sm:px-7",
                          cashReceived >= totalAmount
                            ? "border-green-300 bg-green-50 text-green-700"
                            : "border-red-300 bg-red-50 text-red-700",
                        )}
                      >
                        {cashReceived >= totalAmount ? (
                          <CheckCircle2 className="h-6 w-6 shrink-0" />
                        ) : (
                          <XCircle className="h-6 w-6 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold">
                            {cashReceived >= totalAmount
                              ? "Kembalian"
                              : "Kurang"}
                          </p>
                          <p className="wrap-break-word text-[clamp(1.25rem,3vw,1.75rem)] font-extrabold leading-tight">
                            {cashReceived >= totalAmount
                              ? formatRupiah(change)
                              : formatRupiah(totalAmount - cashReceived)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-7 rounded-xl border border-border bg-muted/40 p-6">
                    <div className="flex items-start gap-4">
                      <WalletCards className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                      <div className="space-y-2">
                        <p className="text-lg font-bold">Pembayaran QRIS</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Sistem akan membuat transaksi QRIS (Midtrans Snap) dan
                          membuka halaman pembayaran untuk pelanggan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Button
                    type="button"
                    className="h-14 w-full rounded-lg text-base font-bold"
                    disabled={!canConfirm}
                    onClick={onConfirm}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Konfirmasi Bayar
                  </Button>
                </div>
              </main>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
