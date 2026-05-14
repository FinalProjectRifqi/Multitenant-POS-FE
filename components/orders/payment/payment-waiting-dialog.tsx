"use client";

/**
 * payment-waiting-dialog.tsx
 *
 * Dialog "Menunggu Pembayaran QRIS" -- ditampilkan setelah createCashlessPayment
 * berhasil. Menampilkan QR code yang bisa discan pelanggan langsung dari layar.
 *
 * Layout:
 *   Left panel  : ringkasan pesanan (item, subtotal, pajak, total, metode)
 *   Right panel : QR code + countdown + jumlah + referensi + provider badges
 *                 + tombol simulator settlement Midtrans
 *
 * Responsibilities:
 *   - Countdown berbasis expiredAt dari backend (default 15 menit)
 *   - Poll GET /orders/:unitId/:orderId/payments/:paymentId setiap 5 detik
 *   - Guard onSuccess/onFailed agar hanya dipanggil sekali (via resolvedRef)
 *   - Tombol simulasi memanggil endpoint backend agar alur webhook ikut diproses
 */

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  QrCode,
  ReceiptText,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { OrderDetail, OrderListItem } from "@/lib/orders/types";
import {
  usePaymentDetailPollingQuery,
  useSimulateMidtransPaymentMutation,
} from "@/lib/queries/pos-orders";
import { cn } from "@/lib/utils";

import Image from "next/image";
import { PAYMENT_METHODS } from "./order-payment-constants";
import { formatRupiah } from "./order-payment-utils";

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Sesuai CASHLESS_EXPIRY_MINUTES di backend payment.service.ts */
const DEFAULT_EXPIRY_SECONDS = 15 * 60;

// const QRIS_PROVIDERS = [
//   "GoPay",
//   "OVO",
//   "Dana",
//   "BCA",
//   "Mandiri",
//   "BRI",
//   "BNI",
//   "ShopeePay",
// ];

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PaymentWaitingDialogProps {
  open: boolean;
  unitId: string;
  orderId: string;
  paymentId: string;
  /** ISO date-time dari backend. Null = fallback 15 menit. */
  expiredAt: string | null;
  referenceNumber: string;
  amount: number;
  acquirer: string;
  /** URL gambar QR code yang dikembalikan backend (via api.qrserver.com). */
  qrCodeUrl: string;
  source: OrderDetail | OrderListItem | null;
  detail: OrderDetail | undefined;
  subtotal: number;
  taxAmount: number;
  totalQty: number;
  onSuccess: (referenceNumber: string) => void;
  onFailed: (reason: string) => void;
  /** Called when user explicitly clicks "Batalkan Pembayaran" — triggers Midtrans cancel. */
  onCancel: () => void;
  /** Called when user dismisses the dialog via X or overlay click — does NOT cancel the payment. */
  onDismiss: () => void;
}

// ─── Pure helpers ───────────────────────────────────────────────────────────────

function secondsUntil(isoDate: string | null): number {
  if (!isoDate) return DEFAULT_EXPIRY_SECONDS;
  return Math.max(
    0,
    Math.floor((new Date(isoDate).getTime() - Date.now()) / 1_000),
  );
}

function mmss(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Countdown hook ────────────────────────────────────────────────────────────

/**
 * Mengelola hitungan mundur (detik) berbasis expiredAt.
 * Otomatis reset saat dialog dibuka. Memanggil onExpired saat mencapai 0.
 */
function useCountdown(
  expiredAt: string | null,
  open: boolean,
  onExpired: () => void,
): number {
  // Inisialisasi saat mount -- Date.now() di dalam initializer setState diizinkan
  const [timeLeft, setTimeLeft] = useState(() => secondsUntil(expiredAt));

  // Ref agar callback terbaru selalu tersedia tanpa masuk ke dependency array
  const onExpiredRef = useRef(onExpired);
  useEffect(() => {
    onExpiredRef.current = onExpired;
  });

  // Reset saat dialog (kembali) dibuka
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(secondsUntil(expiredAt));
    }
  }, [open, expiredAt]);

  // Tick mundur via setTimeout rantai
  useEffect(() => {
    if (!open || timeLeft <= 0) return undefined;
    const id = window.setTimeout(
      () => setTimeLeft((prev) => Math.max(0, prev - 1)),
      1_000,
    );
    return () => window.clearTimeout(id);
  }, [open, timeLeft]);

  // Notifikasi saat habis
  useEffect(() => {
    if (open && timeLeft === 0) {
      onExpiredRef.current();
    }
  }, [open, timeLeft]);

  return timeLeft;
}

// ─── DemoModeNotice ─────────────────────────────────────────────────────────────

function DemoModeNotice() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <div className="flex gap-2">
        <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="leading-relaxed">
          <strong>Mode Simulasi.</strong> Tombol ini memanggil API backend untuk
          meniru webhook Midtrans settlement.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PaymentWaitingDialog({
  open,
  unitId,
  orderId,
  paymentId,
  expiredAt,
  referenceNumber,
  amount,
  acquirer,
  qrCodeUrl,
  source,
  detail,
  subtotal,
  taxAmount,
  totalQty,
  onSuccess,
  onFailed,
  onCancel,
  onDismiss,
}: PaymentWaitingDialogProps) {
  const simulatePaymentSuccessVar =
    process.env.NEXT_PUBLIC_SIMULATE_PAYMENT_SUCCESS;

  const isDemoMode = simulatePaymentSuccessVar === "true";

  // Guard: onSuccess / onFailed hanya boleh dipanggil sekali
  const resolvedRef = useRef(false);
  useEffect(() => {
    if (open) resolvedRef.current = false;
  }, [open]);

  function resolve(type: "success" | "failed", arg: string) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (type === "success") onSuccess(arg);
    else onFailed(arg);
  }

  // Countdown
  const timeLeft = useCountdown(expiredAt, open, () =>
    resolve("failed", "Waktu pembayaran habis"),
  );
  const isExpired = timeLeft === 0;
  const progressPct = (timeLeft / DEFAULT_EXPIRY_SECONDS) * 100;

  // Polling payment status setiap 5 detik
  const paymentQuery = usePaymentDetailPollingQuery(
    unitId,
    orderId,
    paymentId,
    open && !isExpired,
  );
  const simulateMutation = useSimulateMidtransPaymentMutation(
    unitId,
    orderId,
    paymentId,
  );

  useEffect(() => {
    if (!open || !paymentQuery.data) return;
    const status = paymentQuery.data.data.payment_status;
    if (status === "paid") {
      resolve("success", referenceNumber);
    } else if (
      status === "failed" ||
      status === "expired" ||
      status === "cancelled"
    ) {
      const reason =
        status === "expired"
          ? "Waktu pembayaran habis"
          : status === "cancelled"
            ? "Pembayaran dibatalkan"
            : "Pembayaran gagal";
      resolve("failed", reason);
    }
  }, [open, paymentQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Copy referensi
  function handleCopyRef() {
    navigator.clipboard
      .writeText(referenceNumber)
      .then(() => toast.success("No. referensi disalin"))
      .catch(() => toast.error("Gagal menyalin referensi"));
  }

  async function simulatePaymentSuccess() {
    if (isExpired || simulateMutation.isPending) return;
    try {
      await simulateMutation.simulateSuccess();
      await paymentQuery.refetch();
      toast.success("Simulasi settlement Midtrans berhasil diproses");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memproses simulasi";
      toast.error(message);
    }
  }

  // const isPolling = paymentQuery.isFetching;
  const qrisMethod = PAYMENT_METHODS.find((m) => m.id === "qris");
  // dialog tidak bisa di close
  return (
    <Dialog
      open={open}
      // onOpenChange={(next) => {
      //   if (!next) onDismiss();
      // }}
    >
      <DialogContent className="flex h-dvh w-full flex-col overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[95dvh] sm:w-[min(94vw,1160px)] sm:rounded-xl">
        {/* Header */}
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
                  ? `${source.order_number} · ${totalQty || detail?.items.length || 0} item`
                  : "Memuat detail pesanan..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[360px_minmax(0,1fr)]">
            {/* LEFT PANEL — ringkasan pesanan */}
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
                      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-1.5">
                        <span className="font-bold text-primary">
                          {item.quantity}x
                        </span>
                        <span className="min-w-0 font-semibold leading-5">
                          {item.menu_item_name}
                        </span>
                      </div>
                      <span className="shrink-0 font-bold">
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
                  <span className="font-semibold">Total</span>
                  <span className="text-right text-lg font-extrabold">
                    {formatRupiah(amount)}
                  </span>
                </div>
              </section>

              <section className="mt-6 space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Metode Bayar
                </Label>
                <div className="rounded-lg border border-primary bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {qrisMethod && (
                      <qrisMethod.icon className="h-4 w-4 text-primary" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold">QRIS</p>
                      <p className="text-xs text-muted-foreground">
                        Scan QR Code
                      </p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                </div>
              </section>
            </aside>

            {/* RIGHT PANEL — QRIS */}
            <main className="bg-[#FFFCF9] px-5 py-5 sm:px-8 sm:py-7">
              {/* Panel header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Pembayaran QRIS</h3>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700">
                  via MIDTRANS
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan QR berikut menggunakan aplikasi e-wallet atau mobile
                banking Anda
              </p>

              {/* QR + info row */}
              <div className="mt-5 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
                {/* QR Image */}
                <div className="flex items-start justify-center sm:justify-start">
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-sm">
                    {isExpired ? (
                      <div className="flex h-50 w-50 flex-col items-center justify-center gap-4">
                        <AlertCircle className="h-12 w-12 text-red-400" />
                        <p className="text-center text-sm font-medium text-red-500">
                          QR Kadaluarsa
                        </p>
                      </div>
                    ) : (
                      <Image
                        src={qrCodeUrl}
                        alt="QRIS Code"
                        width={210}
                        height={210}
                        className="object-"
                      />
                    )}
                  </div>
                </div>

                {/* Info stack */}
                <div className="flex flex-col gap-3">
                  {/* Countdown + progress bar */}
                  <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        Berlaku dalam
                      </span>
                      <span
                        className={cn(
                          "font-mono text-lg font-bold tabular-nums",
                          timeLeft < 60
                            ? "animate-pulse text-red-600"
                            : "text-foreground",
                        )}
                      >
                        {mmss(timeLeft)}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-muted">
                      <div
                        className={cn(
                          "h-full transition-[width] duration-1000",
                          timeLeft < 60 ? "bg-red-500" : "bg-primary",
                        )}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Jumlah Transfer */}
                  <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Jumlah Transfer
                    </p>
                    <p className="mt-1 text-xl font-extrabold">
                      {formatRupiah(amount)}
                    </p>
                  </div>

                  {/* No. Referensi + copy */}
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="group flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        No. Referensi
                      </p>
                      <p className="mt-1 font-mono text-base font-bold tracking-wide">
                        {referenceNumber}
                      </p>
                    </div>
                    <Copy className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </button>
                </div>
              </div>

              {/* Provider badges */}
              <div className="mt-5">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Diterima Dari
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    key={acquirer}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium"
                  >
                    {acquirer}
                  </span>
                </div>
              </div>

              {/* Demo mode section */}
              {isDemoMode && (
                <div className="mt-5 space-y-3">
                  <DemoModeNotice />
                  <Button
                    type="button"
                    className="h-12 w-full text-sm font-bold"
                    onClick={simulatePaymentSuccess}
                    disabled={isExpired}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Simulasikan Pembayaran Berhasil
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Tombol ini hanya tersedia di mode development
                  </p>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={onCancel}
                    >
                      <X className="h-3.5 w-3.5" />
                      Batalkan Pembayaran
                    </Button>
                  </div>
                </div>
              )}

              {/* Tombol batalkan (production) */}
              {!isDemoMode && (
                <div className="mt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full"
                    onClick={onCancel}
                  >
                    <X className="h-4 w-4" />
                    Batalkan Pembayaran
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
