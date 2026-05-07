// lib/orders/constants.ts
export const TAX_RATE = 0.1;

// Evaluate individually so Next.js static replacement works in the browser
const JUST_IN = process.env.NEXT_PUBLIC_JUST_IN_ORDER_STATUS_ID;
const ON_PROCESS = process.env.NEXT_PUBLIC_ON_PROCESS_ORDER_STATUS_ID;
const READY = process.env.NEXT_PUBLIC_READY_ORDER_STATUS_ID;
const COMPLETE = process.env.NEXT_PUBLIC_COMPLETE_ORDER_STATUS_ID;
const CANCEL = process.env.NEXT_PUBLIC_CANCEL_ORDER_STATUS_ID;

if (!JUST_IN || !ON_PROCESS || !READY || !COMPLETE || !CANCEL) {
  throw new Error("Missing one or more required ORDER_STATUS env vars in .env");
}

export const ORDER_STATUS = {
  JUST_IN,
  ON_PROCESS,
  READY,
  COMPLETE,
  CANCEL,
} as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  [ORDER_STATUS.JUST_IN]: "Baru Masuk",
  [ORDER_STATUS.ON_PROCESS]: "Diproses",
  [ORDER_STATUS.READY]: "Siap Disajikan",
  [ORDER_STATUS.COMPLETE]: "Selesai",
  [ORDER_STATUS.CANCEL]: "Dibatalkan",
};

export const STATUS_FILTER_TABS = [
  { label: "Semua", statusId: undefined },
  { label: "Baru Masuk", statusId: ORDER_STATUS.JUST_IN },
  { label: "Diproses", statusId: ORDER_STATUS.ON_PROCESS },
  { label: "Siap Disajikan", statusId: ORDER_STATUS.READY },
  { label: "Selesai", statusId: ORDER_STATUS.COMPLETE },
  { label: "Dibatalkan", statusId: ORDER_STATUS.CANCEL },
] as const;
