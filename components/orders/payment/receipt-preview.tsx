import type { OrderDetail, OrderListItem } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

import type { PaymentMethod } from "./order-payment-constants";
import { formatRupiah, getMethodLabel } from "./order-payment-utils";

interface ReceiptPreviewProps {
  detail: OrderDetail | undefined;
  source: OrderDetail | OrderListItem;
  method: PaymentMethod;
  reference?: string;
}

export function ReceiptPreview({
  detail,
  source,
  method,
  reference,
}: ReceiptPreviewProps) {
  const subtotal =
    detail?.subtotal ?? Math.round((source.total_amount ?? 0) / 1.1);
  const taxAmount = detail?.tax_amount ?? source.total_amount - subtotal;
  const dateText = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeText = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex h-full flex-col bg-background px-6 py-6 sm:px-8 sm:py-7">
      <div className="text-center">
        <h3 className="text-lg font-extrabold tracking-wide">RESTORAN XYZ</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Jl. Sudirman No. 1, Jakarta Pusat
        </p>
        <p className="text-sm text-muted-foreground">Telp: (021) 555-0100</p>
      </div>

      <div className="my-5 h-px border-t border-dashed border-border" />

      <div className="flex justify-between gap-4 text-sm">
        <div className="text-muted-foreground">
          <p>{dateText}</p>
          <p>No. Ref</p>
        </div>
        <div className="text-right font-semibold">
          <p>{timeText}</p>
          <p>{reference ?? source.order_number}</p>
        </div>
      </div>

      <div className="my-5 h-px border-t border-dashed border-border" />

      <div className="space-y-3">
        {detail?.items.map((item) => (
          <div key={item.order_item_id} className="flex justify-between gap-4">
            <div className="min-w-0">
              <p className="font-bold">{item.menu_item_name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} x {formatRupiah(item.item_price)}
              </p>
            </div>
            <p className="shrink-0 font-bold">{formatRupiah(item.subtotal)}</p>
          </div>
        ))}
      </div>

      <div className="my-5 h-px border-t border-dashed border-border" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pajak (10%)</span>
          <span>{formatRupiah(taxAmount)}</span>
        </div>
      </div>

      <div className="my-4 h-px bg-border" />

      <div className="flex items-center justify-between">
        <span className="text-lg font-extrabold">TOTAL</span>
        <span className="text-xl font-extrabold text-primary">
          {formatRupiah(source.total_amount)}
        </span>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted-foreground">Metode Bayar</span>
        <span className="font-semibold">{getMethodLabel(method)}</span>
      </div>

      <div className="my-5 h-px border-t border-dashed border-border" />

      <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
        <div className="grid h-24 w-24 grid-cols-5 gap-1 rounded-md bg-primary/10 p-2">
          {Array.from({ length: 25 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "rounded-xs",
                index % 2 === 0 || index % 7 === 0 ? "bg-primary" : "bg-white",
              )}
            />
          ))}
        </div>
        <p>Scan untuk struk digital</p>
      </div>

      <div className="mt-auto border-t border-dashed border-border pt-5 text-center text-sm text-muted-foreground">
        <p>Terima kasih telah mempercayai kami</p>
        <p>Selamat menikmati hidangan Anda</p>
      </div>
    </div>
  );
}
