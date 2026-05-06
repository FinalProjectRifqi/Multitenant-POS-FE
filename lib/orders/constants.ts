// lib/orders/constants.ts

export const TAX_RATE = 0.1;

export const ORDER_STATUS = {
  PENDING: process.env.NEXT_PUBLIC_ORDER_STATUS_PENDING_ID!,
  ON_PROCESS: process.env.NEXT_PUBLIC_ORDER_STATUS_ON_PROCESS_ID!,
  READY: process.env.NEXT_PUBLIC_ORDER_STATUS_READY_ID!,
  COMPLETE: process.env.NEXT_PUBLIC_ORDER_STATUS_COMPLETE_ID!,
  CANCEL: process.env.NEXT_PUBLIC_ORDER_STATUS_CANCEL_ID!,
} as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "Menunggu",
  [ORDER_STATUS.ON_PROCESS]: "Diproses",
  [ORDER_STATUS.READY]: "Siap",
  [ORDER_STATUS.COMPLETE]: "Selesai",
  [ORDER_STATUS.CANCEL]: "Dibatalkan",
};

export const STATUS_FILTER_TABS = [
  { label: "Semua", statusId: undefined },
  { label: "Menunggu", statusId: ORDER_STATUS.PENDING },
  { label: "Diproses", statusId: ORDER_STATUS.ON_PROCESS },
  { label: "Siap", statusId: ORDER_STATUS.READY },
  { label: "Selesai", statusId: ORDER_STATUS.COMPLETE },
] as const;
