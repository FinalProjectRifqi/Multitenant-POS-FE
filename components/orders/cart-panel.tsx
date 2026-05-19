"use client";

// components/orders/cart-panel.tsx

import {
  ArrowRight,
  ClipboardList,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CartItem, OrderTypeEntity } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import React from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function getOrderTypeIcon(code: string) {
  const lc = code.toLowerCase();
  if (lc.includes("dine")) return <Utensils className="h-4 w-4" />;
  if (lc.includes("take") || lc.includes("away"))
    return <ShoppingBag className="h-4 w-4" />;
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CartPanelProps {
  mode: "create" | "edit";
  orderNumber?: string;
  className?: string;
  orderTypes: OrderTypeEntity[];
  orderTypeId: string;
  onOrderTypeChange: (id: string) => void;
  isDineIn: boolean;
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  tableNumber: string;
  onTableNumberChange: (v: string) => void;
  orderNotes: string;
  onOrderNotesChange: (v: string) => void;
  cart: CartItem[];
  onUpdateQty: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onClearCart: () => void;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  onSubmit: () => void;
  isMutating: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CartPanel({
  mode,
  orderNumber,
  className,
  orderTypes,
  orderTypeId,
  onOrderTypeChange,
  isDineIn,
  customerName,
  onCustomerNameChange,
  tableNumber,
  onTableNumberChange,
  orderNotes,
  onOrderNotesChange,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  subtotal,
  taxAmount,
  totalAmount,
  onSubmit,
  isMutating,
}: CartPanelProps) {
  const isEmpty = cart.length === 0;
  const totalQty = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#FAF8F6] overflow-hidden",
        "max-lg:border max-lg:border-border max-lg:rounded-2xl",
        className,
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon container */}
          <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm leading-tight">
              {orderNumber ? "Pesanan" : "Pesanan Baru"}
            </h2>
            {orderNumber && (
              <p className="text-xs text-muted-foreground font-medium">
                {orderNumber}
              </p>
            )}
          </div>
        </div>

        {/* "Hapus Semua" — pill Button style */}
        {!isEmpty && (
          <Button
            type="button"
            onClick={onClearCart}
            className="text-xs font-semibold text-destructive border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 rounded-full px-3 py-1.5 transition-colors shrink-0"
          >
            Hapus Semua
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border shrink-0 mx-0" />

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Order type tabs */}
        {orderTypes.length > 0 && (
          <div className="px-4 pt-4 pb-3">
            <Tabs value={orderTypeId} onValueChange={onOrderTypeChange}>
              <TabsList className="w-full h-auto p-1.5 bg-muted rounded-xl">
                {orderTypes.map((ot) => (
                  <TabsTrigger
                    key={ot.order_type_id}
                    value={ot.order_type_id}
                    className={cn(
                      "flex-1 gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                      "data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground",
                      "data-[state=inactive]:text-muted-foreground",
                    )}
                  >
                    {getOrderTypeIcon(ot.order_type_code)}
                    {ot.order_type_name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border mx-0" />

        {/* Customer fields */}
        <div className="px-4 py-4 space-y-4">
          {/* Customer name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="customer_name"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Nama Pelanggan
            </Label>
            <Input
              id="customer_name"
              placeholder="Masukkan nama..."
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="h-10 text-sm bg-muted/40 border-muted-foreground/20 rounded-xl"
            />
          </div>

          {/* Table number — Dine In only */}
          {isDineIn && (
            <div className="space-y-1.5">
              <Label
                htmlFor="table_number"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Nomor Meja
              </Label>
              <Input
                id="table_number"
                placeholder="Nomor meja..."
                value={tableNumber}
                onChange={(e) => onTableNumberChange(e.target.value)}
                className="h-10 text-sm bg-muted/40 border-muted-foreground/20 rounded-xl"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label
              htmlFor="order_notes"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Catatan{" "}
              <span className="normal-case font-normal tracking-normal">
                (opsional)
              </span>
            </Label>
            <Input
              id="order_notes"
              placeholder="Catatan pesanan..."
              value={orderNotes}
              onChange={(e) => onOrderNotesChange(e.target.value)}
              className="h-10 text-sm bg-muted/40 border-muted-foreground/20 rounded-xl"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-0" />

        {/* ── Cart items ─────────────────────────────────────────────────── */}
        {isEmpty ? (
          <p className="text-center text-sm text-muted-foreground py-10 px-4">
            Belum ada item dalam pesanan
          </p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <React.Fragment key={item.menu_item_id}>
                <li className="flex items-center gap-3 px-4 py-3.5">
                  {/* Qty badge */}
                  <span className="text-xs font-bold text-muted-foreground bg-muted rounded-lg h-7 w-7 flex items-center justify-center shrink-0">
                    {item.quantity}×
                  </span>

                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">
                      {item.menu_item_name}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      {formatRupiah(item.item_price * item.quantity)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Minus — outline circle */}
                    <Button
                      type="button"
                      onClick={() => onUpdateQty(item.menu_item_id, -1)}
                      className="h-7 w-7 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3 text-primary" />
                    </Button>

                    <span className="w-5 text-center text-sm font-bold">
                      {item.quantity}
                    </span>

                    {/* Plus — filled primary */}
                    <Button
                      type="button"
                      onClick={() => onUpdateQty(item.menu_item_id, 1)}
                      className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>

                    {/* Trash */}
                    <Button
                      type="button"
                      onClick={() => onRemoveItem(item.menu_item_id)}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-destructive bg-destructive/10 transition-colors ml-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>

                {/* Row divider between items */}
                {index < cart.length - 1 && (
                  <div
                    key={`sep-${item.menu_item_id}`}
                    className="h-px bg-border/60 mx-4"
                  />
                )}
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer: totals + submit (always pinned to bottom) ────────────── */}
      <div className="shrink-0 border-t border-border bg-background">
        {/* Subtotal rows */}
        <div className="px-5 pt-4 pb-3 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal ({totalQty} item)</span>
            <span className="font-medium text-foreground">
              {formatRupiah(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pajak (10%)</span>
            <span className="font-medium text-foreground">
              {formatRupiah(taxAmount)}
            </span>
          </div>
        </div>

        {/* Total card */}
        <div className="mx-4 mb-4 bg-primary rounded-2xl p-4 overflow-hidden">
          <p className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-widest mb-1">
            Total Pembayaran
          </p>
          <p className="text-3xl font-extrabold text-primary-foreground mb-4 tracking-tight">
            {formatRupiah(totalAmount)}
          </p>
          <Button
            type="button"
            disabled={isEmpty || isMutating || !customerName.trim()}
            onClick={onSubmit}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-primary-foreground border border-white/20 text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isMutating && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Tambah Pesanan" : "Simpan Perubahan"}
            {!isMutating && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
