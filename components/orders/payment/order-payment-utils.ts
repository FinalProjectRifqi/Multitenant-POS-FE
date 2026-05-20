import type { OrderDetail, OrderListItem } from "@/lib/orders/types";

import { PAYMENT_METHODS, type PaymentMethod } from "./order-payment-constants";

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatInputAmount(value: number): string {
  if (value <= 0) return "";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseInputAmount(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function roundUpToNearest(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

export function getQuickAmounts(totalAmount: number): number[] {
  if (!totalAmount) return [];
  const scale = totalAmount >= 1_000_000 ? 1_000_000 : 5_000;
  return [
    totalAmount,
    roundUpToNearest(totalAmount + scale, scale),
    roundUpToNearest(totalAmount + scale * 2, scale),
  ];
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.replace(/^\[\d+\]\s*/, "");
  if (typeof error === "string") return error;
  return "Pembayaran tidak dapat diproses. Silakan coba lagi.";
}

export function getMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((item) => item.id === method)?.label ?? "Tunai";
}

export function getOrderPlace(order: OrderDetail | OrderListItem): string {
  return order.table_number
    ? `Meja ${order.table_number}`
    : order.order_type_name;
}
