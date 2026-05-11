import {
  CheckCircle2,
  Printer,
  ReceiptText,
  RotateCcw,
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
import type { OrderDetail, OrderListItem } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

import type { ResultState } from "./order-payment-constants";
import { formatRupiah, getMethodLabel } from "./order-payment-utils";
import { ReceiptPreview } from "./receipt-preview";

interface PaymentResultDialogProps {
  result: ResultState | null;
  source: OrderDetail | OrderListItem | null;
  detail: OrderDetail | undefined;
  totalQty: number;
  onCloseAll: () => void;
  onRetry: () => void;
}

export function PaymentResultDialog({
  result,
  source,
  detail,
  totalQty,
  onCloseAll,
  onRetry,
}: PaymentResultDialogProps) {
  if (!result || !source) return null;

  return (
    <Dialog
      open={Boolean(result)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCloseAll();
      }}
    >
      <DialogContent className="flex h-dvh w-full flex-col overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[95dvh] sm:w-[min(94vw,1160px)] sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-14 sm:px-8 sm:py-6 sm:pr-16">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold">
                {result.status === "success"
                  ? "Pembayaran Berhasil"
                  : "Pembayaran Gagal"}
              </DialogTitle>
              <DialogDescription>
                {source.order_number} - {totalQty || detail?.items.length || 0}{" "}
                item
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid bg-[#FFFCF9] md:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="flex min-w-0 flex-col items-center justify-center border-b border-border bg-[#FAF8F6] px-8 py-10 text-center md:border-b-0 md:border-r">
              <div
                className={cn(
                  "flex h-28 w-28 items-center justify-center rounded-full",
                  result.status === "success"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                {result.status === "success" ? (
                  <CheckCircle2 className="h-16 w-16" />
                ) : (
                  <XCircle className="h-16 w-16" />
                )}
              </div>
              <h3 className="mt-8 text-2xl font-extrabold">
                {result.status === "success"
                  ? "Pembayaran Berhasil!"
                  : "Pembayaran Gagal"}
              </h3>
              <p className="mt-3 max-w-56 text-sm leading-6 text-muted-foreground">
                {result.status === "success"
                  ? "Transaksi telah diproses dengan sukses"
                  : result.reason}
              </p>
              <div
                className={cn(
                  "mt-7 w-full rounded-lg border px-5 py-4",
                  result.status === "success"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-red-300 bg-red-50 text-red-700",
                )}
              >
                <p className="text-sm font-semibold">
                  {getMethodLabel(result.method)}
                </p>
                <p className="mt-1 text-3xl font-extrabold leading-tight">
                  {formatRupiah(result.amount)}
                </p>
              </div>
            </aside>

            <div className="flex min-w-0 flex-col">
              <div className="flex-1">
                <ReceiptPreview
                  detail={detail}
                  source={source}
                  method={result.method}
                  reference={
                    result.status === "success" ? result.reference : undefined
                  }
                />
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-4 border-t border-border bg-background px-5 py-4 max-sm:grid-cols-1 sm:px-8 sm:py-5">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                  Cetak Struk
                </Button>
                {result.status === "success" ? (
                  <Button type="button" className="h-12" onClick={onCloseAll}>
                    <RotateCcw className="h-4 w-4" />
                    Pesanan Baru
                  </Button>
                ) : (
                  <Button type="button" className="h-12" onClick={onRetry}>
                    <RotateCcw className="h-4 w-4" />
                    Coba Lagi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
