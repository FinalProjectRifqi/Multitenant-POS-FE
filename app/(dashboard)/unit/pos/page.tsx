"use client";

import { ShoppingCart, Plus, Minus, CreditCard, Search } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/ui";

const MENU_ITEMS = [
  { id: 1, name: "Nasi Goreng Special", price: 35000, category: "Makanan" },
  { id: 2, name: "Ayam Bakar",          price: 45000, category: "Makanan" },
  { id: 3, name: "Sate Kambing",        price: 55000, category: "Makanan" },
  { id: 4, name: "Mie Goreng",          price: 30000, category: "Makanan" },
  { id: 5, name: "Es Teh",              price: 8000,  category: "Minuman" },
  { id: 6, name: "Jus Jeruk",           price: 18000, category: "Minuman" },
  { id: 7, name: "Coca-Cola",           price: 15000, category: "Minuman" },
  { id: 8, name: "Es Jeruk",            price: 12000, category: "Minuman" },
];

type CartItem = { id: number; name: string; price: number; qty: number };

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function KelolaPesananPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  const filtered = MENU_ITEMS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(item: (typeof MENU_ITEMS)[0]) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
        .filter((c) => c.qty > 0)
    );
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return (
    <div className="p-8">
      <PageHeader title="Kelola Pesanan" description="Tambah & kelola pesanan pelanggan" />

      <div className="flex gap-6">
        {/* ── Menu panel ── */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <ShoppingCart className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-semibold text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                <p className="text-primary font-bold text-sm mt-2">{formatRupiah(item.price)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Cart panel ── */}
        <div className="w-80 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-8 space-y-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Keranjang
              {cart.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  {cart.reduce((s, c) => s + c.qty, 0)}
                </span>
              )}
            </h2>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada item</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, +1)} className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-bold text-foreground">{formatRupiah(subtotal)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                <CreditCard className="w-4 h-4" /> Proses Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
