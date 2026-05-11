"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PaymentDetailSheet } from "@/components/orders/payment/payment-detail-sheet";
import { PaymentProcessDialog } from "@/components/orders/payment/payment-process-dialog";
import { PaymentResultDialog } from "@/components/orders/payment/payment-result-dialog";
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
  usePosOrderDetailQuery,
} from "@/lib/queries/pos-orders";

interface OrderPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  order: OrderListItem | null;
}

export function OrderPaymentDialog({
  open,
  onOpenChange,
  unitId,
  order,
}: OrderPaymentDialogProps) {
  const orderId = order?.order_id ?? "";
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [processOpen, setProcessOpen] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [cashReceived, setCashReceived] = useState(0);

  const currentUser = useCurrentUser();
  const isStaffUnit = currentUser?.role?.role_code === ROLE_CODE.STAF_UNIT;
  const isRoleReady = Boolean(currentUser?.role?.role_code);
  const isCashAllowed = isStaffUnit;
  const effectiveMethod: PaymentMethod = isStaffUnit ? method : "qris";

  const detailQuery = usePosOrderDetailQuery(unitId, orderId);
  const cashMutation = useCreateCashPaymentMutation(unitId, orderId);
  const cashlessMutation = useCreateCashlessPaymentMutation(unitId, orderId);

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

  const quickAmounts = useMemo(() => {
    return getQuickAmounts(totalAmount);
  }, [totalAmount]);

  function closeAll() {
    setProcessOpen(false);
    setResult(null);
    setCashReceived(0);
    onOpenChange(false);
  }

  async function handleConfirmPayment() {
    if (!source || !canPayStatus) return;

    if (effectiveMethod === "cash" && !isCashAllowed) {
      toast.error("Pembayaran tunai hanya untuk Staf Unit.");
      return;
    }

    try {
      if (effectiveMethod === "cash") {
        const response = await cashMutation.createCashPayment({
          amount: totalAmount,
        });
        setProcessOpen(false);
        setResult({
          status: "success",
          method: effectiveMethod,
          amount: totalAmount,
          reference: response.payment.reference_number,
        });
        return;
      }

      const response = await cashlessMutation.createCashlessPayment({
        amount: totalAmount,
      });
      if (response.redirect_url) {
        window.open(response.redirect_url, "_blank", "noopener,noreferrer");
      }
      setProcessOpen(false);
      setResult({
        status: "success",
        method: effectiveMethod,
        amount: totalAmount,
        reference: response.payment.reference_number,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (/payment aktif|active payment|already.*payment/i.test(errorMessage)) {
        toast.error(errorMessage, { position: "top-right" });
      }

      setProcessOpen(false);
      setResult({
        status: "failed",
        method: effectiveMethod,
        amount: totalAmount,
        reason: errorMessage,
      });
    }
  }

  return (
    <>
      <PaymentDetailSheet
        open={open && !processOpen && !result}
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
        onProcess={() => setProcessOpen(true)}
      />

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
