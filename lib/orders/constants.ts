// lib/orders/constants.ts

export const TAX_RATE = 0.1;

export const ORDER_STATUS = {
  JUST_IN: process.env.NEXT_PUBLIC_JUST_IN_ORDER_STATUS_ID!,
  ON_PROCESS: process.env.NEXT_PUBLIC_ON_PROCESS_ORDER_STATUS_ID!,
  READY: process.env.NEXT_PUBLIC_READY_ORDER_STATUS_ID!,
  COMPLETE: process.env.NEXT_PUBLIC_COMPLETE_ORDER_STATUS_ID!,
  CANCEL: process.env.NEXT_PUBLIC_CANCEL_ORDER_STATUS_ID!,
} as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  [ORDER_STATUS.JUST_IN]: "Baru Masuk",
  [ORDER_STATUS.ON_PROCESS]: "Diproses",
  [ORDER_STATUS.READY]: "Siap Disajikan",
  [ORDER_STATUS.COMPLETE]: "Selesai",
  [ORDER_STATUS.CANCEL]: "Dibatalkan",
};

console.log("Loaded order status constants:", ORDER_STATUS);

export const STATUS_FILTER_TABS = [
  { label: "Semua", statusId: undefined },
  { label: "Baru Masuk", statusId: ORDER_STATUS.JUST_IN },
  { label: "Diproses", statusId: ORDER_STATUS.ON_PROCESS },
  { label: "Siap Disajikan", statusId: ORDER_STATUS.READY },
  { label: "Selesai", statusId: ORDER_STATUS.COMPLETE },
  { label: "Dibatalkan", statusId: ORDER_STATUS.CANCEL },
] as const;
