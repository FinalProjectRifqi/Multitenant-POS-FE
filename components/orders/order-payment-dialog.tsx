"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PaymentDetailSheet } from "@/components/orders/payment/payment-detail-sheet";
import { PaymentProcessDialog } from "@/components/orders/payment/payment-process-dialog";
import { PaymentResultDialog } from "@/components/orders/payment/payment-result-dialog";
import { PaymentWaitingDialog } from "@/components/orders/payment/payment-waiting-dialog";
import { ROLE_CODE } from "@/lib/constants/roles";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import type {
  PaymentMethod,
  ResultState,
} from "@/components/orders/payment/order-payment-constants";
import {
  getErrorMessage,
  getQuickAmounts,
} from "@/components/orders/payment/order-payment-utils";
import { ORDER_STATUS } from "@/lib/orders/constants";
import type { OrderListItem } from "@/lib/orders/types";
import {
  useCreateCashlessPaymentMutation,
  useCreateCashPaymentMutation,
  useCancelPaymentMutation,
  usePosOrderDetailQuery,
} from "@/lib/queries/pos-orders";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OrderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  order: OrderListItem | null;
}

/** State aktif untuk pembayaran QRIS yang sedang menunggu konfirmasi */
interface ActiveQrisPayment {
  paymentId: string;
  expiredAt: string | null;
  referenceNumber: string;
  acquirer: string;
  /** URL gambar QR code untuk ditampilkan ke pelanggan */
  qrCodeUrl: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function OrderPaymentDialog({
  open,
  onOpenChange,
  unitId,
  order,
}: OrderPaymentDialogProps) {
  const orderId = order?.order_id ?? "";

  // ── UI state ────────────────────────────────────────────────────────────────
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [processOpen, setProcessOpen] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [cashReceived, setCashReceived] = useState(0);

  // ── QRIS waiting state ───────────────────────────────────────────────────────
  const [waitingOpen, setWaitingOpen] = useState(false);
  const [activeQris, setActiveQris] = useState<ActiveQrisPayment | null>(null);
  const cancelMutation = useCancelPaymentMutation(unitId, orderId);

  // ── Auth / role ──────────────────────────────────────────────────────────────
  const currentUser = useCurrentUser();
  const isStaffUnit = currentUser?.role?.role_code === ROLE_CODE.STAF_UNIT;
  const isRoleReady = Boolean(currentUser?.role?.role_code);
  const isCashAllowed = isStaffUnit;
  const effectiveMethod: PaymentMethod = isStaffUnit ? method : "qris";

  // ── Queries ──────────────────────────────────────────────────────────────────
  const detailQuery = usePosOrderDetailQuery(unitId, orderId);
  const cashMutation = useCreateCashPaymentMutation(unitId, orderId);
  const cashlessMutation = useCreateCashlessPaymentMutation(unitId, orderId);

  // ── Derived values ───────────────────────────────────────────────────────────
  const detail = detailQuery.data?.data;
  const source = detail ?? order;
  const subtotal =
    detail?.subtotal ?? Math.round((order?.total_amount ?? 0) / 1.1);
  const taxAmount = detail?.tax_amount ?? (order?.total_amount ?? 0) - subtotal;
  const totalAmount = detail?.total_amount ?? order?.total_amount ?? 0;
  const totalQty =
    detail?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const change = Math.max(cashReceived - totalAmount, 0);
  const canPayStatus = source?.order_status_id === ORDER_STATUS.READY;
  const isPending = cashMutation.isPending || cashlessMutation.isPending;
  const canConfirm =
    Boolean(source) &&
    canPayStatus &&
    !isPending &&
    (effectiveMethod !== "cash" ||
      (cashReceived >= totalAmount && isCashAllowed));

  const quickAmounts = useMemo(
    () => getQuickAmounts(totalAmount),
    [totalAmount],
  );

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function closeAll() {
    setProcessOpen(false);
    setWaitingOpen(false);
    setActiveQris(null);
    setResult(null);
    setCashReceived(0);
    onOpenChange(false);
  }

  // ── QRIS waiting dialog callbacks ────────────────────────────────────────────

  function handleQrisSuccess(referenceNumber: string) {
    setWaitingOpen(false);
    setActiveQris(null);
    setResult({
      status: "success",
      method: "qris",
      amount: totalAmount,
      reference: referenceNumber,
    });
  }

  function handleQrisFailed(reason: string) {
    setWaitingOpen(false);
    setActiveQris(null);
    setResult({
      status: "failed",
      method: "qris",
      amount: totalAmount,
      reason,
    });
  }

  async function handleQrisCancel() {
    const paymentId = activeQris?.paymentId;
    setWaitingOpen(false);
    setActiveQris(null);
    if (!paymentId) return;
    try {
      await cancelMutation.cancelPayment(paymentId);
    } catch {
      toast.error("Gagal membatalkan pembayaran", { position: "top-right" });
    }
  }

  // ── Main confirm handler ─────────────────────────────────────────────────────

  async function handleConfirmPayment() {
    if (!source || !canPayStatus) return;

    if (effectiveMethod === "cash" && !isCashAllowed) {
      toast.error("Pembayaran tunai hanya untuk Staf Unit.");
      return;
    }

    try {
      // ── Cash ────────────────────────────────────────────────────────────────
      if (effectiveMethod === "cash") {
        const response = await cashMutation.createCashPayment({
          amount: totalAmount,
        });
        setProcessOpen(false);
        setResult({
          status: "success",
          method: effectiveMethod,
          amount: totalAmount,
          reference: response.reference_number,
        });
        return;
      }

      // ── QRIS / cashless ──────────────────────────────────────────────────────
      const response = await cashlessMutation.createCashlessPayment({
        amount: totalAmount,
      });

      // Simpan data payment aktif untuk PaymentWaitingDialog
      setActiveQris({
        paymentId: response.payment.payment_id,
        expiredAt: response.payment.expired_at,
        referenceNumber: response.payment.reference_number,
        qrCodeUrl: response.qr_code_url,
        acquirer: response.acquirer,
      });

      // Tutup process dialog, buka waiting dialog
      setProcessOpen(false);
      setWaitingOpen(true);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (/payment aktif|active payment|already.*payment/i.test(errorMessage)) {
        toast.error(errorMessage, { position: "top-right" });
      }

      setProcessOpen(false);
      setWaitingOpen(false);
      setActiveQris(null);
      setResult({
        status: "failed",
        method: effectiveMethod,
        amount: totalAmount,
        reason: errorMessage,
      });
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Step 1: Detail & method selection */}
      <PaymentDetailSheet
        open={open && !processOpen && !waitingOpen && !result}
        onOpenChange={onOpenChange}
        source={source}
        detail={detail}
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        subtotal={subtotal}
        taxAmount={taxAmount}
        totalAmount={totalAmount}
        totalQty={totalQty}
        method={effectiveMethod}
        onMethodChange={setMethod}
        isCashAllowed={isCashAllowed}
        isRoleReady={isRoleReady}
        canPayStatus={canPayStatus}
        isPending={isPending}
        onProcess={() => {
          if (effectiveMethod === "qris") {
            void handleConfirmPayment();
          } else {
            setProcessOpen(true);
          }
        }}
      />

      {/* Step 2: Payment process (cash input / QRIS confirmation) */}
      <PaymentProcessDialog
        open={processOpen}
        onOpenChange={setProcessOpen}
        source={source}
        detail={detail}
        totalAmount={totalAmount}
        subtotal={subtotal}
        taxAmount={taxAmount}
        totalQty={totalQty}
        method={effectiveMethod}
        cashReceived={cashReceived}
        onCashReceivedChange={setCashReceived}
        quickAmounts={quickAmounts}
        change={change}
        isCashAllowed={isCashAllowed}
        isRoleReady={isRoleReady}
        canConfirm={canConfirm}
        isPending={isPending}
        onConfirm={handleConfirmPayment}
      />

      {/* Step 3 (QRIS only): Waiting for payment with QR display */}
      {activeQris && (
        <PaymentWaitingDialog
          open={waitingOpen}
          unitId={unitId}
          orderId={orderId}
          paymentId={activeQris.paymentId}
          expiredAt={activeQris.expiredAt}
          acquirer={activeQris.acquirer}
          referenceNumber={activeQris.referenceNumber}
          qrCodeUrl={activeQris.qrCodeUrl}
          amount={totalAmount}
          source={source}
          detail={detail}
          subtotal={subtotal}
          taxAmount={taxAmount}
          totalQty={totalQty}
          onSuccess={handleQrisSuccess}
          onFailed={handleQrisFailed}
          onCancel={handleQrisCancel}
        />
      )}

      {/* Step 4: Result (success or failed) */}
      <PaymentResultDialog
        result={result}
        source={source}
        detail={detail}
        totalQty={totalQty}
        onCloseAll={closeAll}
        onRetry={() => {
          setResult(null);
          setProcessOpen(true);
        }}
      />
    </>
  );
}
