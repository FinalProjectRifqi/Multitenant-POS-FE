/**
 * lib/types/midtrans.d.ts
 *
 * Type declarations for the Midtrans Snap.js browser global (window.snap).
 * The script is loaded via <Script> in app/layout.tsx.
 *
 * Reference: https://docs.midtrans.com/reference/snap-js
 */

interface MidtransSnapResult {
  order_id: string;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  status_message: string;
}

interface MidtransSnapCallbacks {
  onSuccess?: (result: MidtransSnapResult) => void;
  onPending?: (result: MidtransSnapResult) => void;
  onError?: (result: MidtransSnapResult) => void;
  onClose?: () => void;
}

interface MidtransSnap {
  pay(token: string, callbacks?: MidtransSnapCallbacks): void;
  hide(): void;
}

declare global {
  interface Window {
    snap?: MidtransSnap;
  }
}

export {};
