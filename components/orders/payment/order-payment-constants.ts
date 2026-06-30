import { Banknote, QrCode } from "lucide-react";

export type PaymentMethod = "cash" | "qris";

export type ResultState =
  | {
      status: "success";
      method: PaymentMethod;
      amount: number;
      reference?: string;
      /** For cash: the amount the customer handed over (to show change on receipt) */
      paidAmount?: number;
    }
  | {
      status: "failed";
      method: PaymentMethod;
      amount: number;
      reason: string;
    };

export const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Banknote;
}> = [
  { id: "cash", label: "Tunai", description: "Bayar langsung", icon: Banknote },
  { id: "qris", label: "QRIS", description: "Midtrans Snap", icon: QrCode },
];
