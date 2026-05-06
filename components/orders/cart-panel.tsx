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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CartItem, OrderTypeEntity } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

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
  // Order type
  orderTypes: OrderTypeEntity[];
  orderTypeId: string;
  onOrderTypeChange: (id: string) => void;
  isDineIn: boolean;
  // Customer info
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  tableNumber: string;
  onTableNumberChange: (v: string) => void;
  orderNotes: string;
  onOrderNotesChange: (v: string) => void;
  // Cart
  cart: CartItem[];
  onUpdateQty: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onClearCart: () => void;
  // Totals
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  // Submit
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
        "flex flex-col border border-border rounded-2xl bg-card overflow-hidden shrink-0 self-start",
        className,
      )}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            {orderNumber ? (
              <>
                <h2 className="font-semibold text-sm leading-tight">Pesanan</h2>
                <p className="text-xs text-muted-foreground">{orderNumber}</p>
              </>
            ) : (
              <h2 className="font-semibold text-sm leading-tight">
                Pesanan Baru
              </h2>
            )}
          </div>
        </div>
        {!isEmpty && (
          <button
            type="button"
            className="text-xs text-destructive hover:underline underline-offset-2 shrink-0"
            onClick={onClearCart}
          >
            Hapus Semua
          </button>
        )}
      </div>

      <Separator />

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Order type toggle — shadcn Tabs */}
        {orderTypes.length > 0 && (
          <Tabs value={orderTypeId} onValueChange={onOrderTypeChange}>
            <TabsList className="w-full h-auto p-1">
              {orderTypes.map((ot) => (
                <TabsTrigger
                  key={ot.order_type_id}
                  value={ot.order_type_id}
                  className="flex-1 gap-1.5 py-2 text-xs font-medium"
                >
                  {getOrderTypeIcon(ot.order_type_code)}
                  {ot.order_type_name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Customer name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="customer_name"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Nama Pelanggan
          </Label>
          <Input
            id="customer_name"
            placeholder="Nama pelanggan..."
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        {/* Table number — only for Dine In */}
        {isDineIn && (
          <div className="space-y-1.5">
            <Label
              htmlFor="table_number"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Nomor Meja
            </Label>
            <Input
              id="table_number"
              placeholder="Nomor meja..."
              value={tableNumber}
              onChange={(e) => onTableNumberChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <Label
            htmlFor="order_notes"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Catatan <span className="normal-case font-normal">(opsional)</span>
          </Label>
          <Input
            id="order_notes"
            placeholder="Catatan pesanan..."
            value={orderNotes}
            onChange={(e) => onOrderNotesChange(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <Separator />

        {/* Cart items */}
        {isEmpty ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            Belum ada item dalam pesanan
          </p>
        ) : (
          <ul className="space-y-3.5">
            {cart.map((item) => (
              <li key={item.menu_item_id} className="flex items-start gap-2">
                {/* Qty prefix */}
                <span className="text-xs font-bold text-primary shrink-0 mt-0.5 w-5 text-right">
                  {item.quantity}×
                </span>

                {/* Name + controls + total price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-sm font-medium leading-tight truncate">
                      {item.menu_item_name}
                    </p>
                    {/* Controls */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-5 w-5 rounded-full"
                        onClick={() => onUpdateQty(item.menu_item_id, -1)}
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </Button>
                      <span className="w-4 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-5 w-5 rounded-full"
                        onClick={() => onUpdateQty(item.menu_item_id, 1)}
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveItem(item.menu_item_id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                  {/* Total per item */}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRupiah(item.item_price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Totals + submit ── */}
      <div className="px-4 pt-3 pb-4 border-t border-border space-y-3">
        {/* Subtotal + tax */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({totalQty} item)</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Pajak (10%)</span>
            <span>{formatRupiah(taxAmount)}</span>
          </div>
        </div>

        {/* Total dark card */}
        <div className="bg-primary rounded-2xl p-4">
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-primary-foreground/70 uppercase tracking-widest mb-0.5">
              Total Pembayaran
            </p>
            <p className="text-2xl font-bold text-primary-foreground">
              {formatRupiah(totalAmount)}
            </p>
          </div>
          <button
            type="button"
            disabled={isEmpty || isMutating || !customerName.trim()}
            onClick={onSubmit}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-primary-foreground border border-white/20 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "create" ? "Tambah Pesanan" : "Simpan Perubahan"}
            {!isMutating && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
