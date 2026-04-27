"use client";

import { ChefHat, Clock, CheckCircle2, AlertCircle, Timer } from "lucide-react";

const DUMMY_ORDERS = [
  { id: "ORD-001", table: "Meja 3",  items: ["Nasi Goreng Special", "Es Teh"],        status: "baru",    time: "2 menit lalu" },
  { id: "ORD-002", table: "Meja 7",  items: ["Ayam Bakar", "Sup Tomat", "Jus Jeruk"], status: "proses",  time: "8 menit lalu" },
  { id: "ORD-003", table: "Meja 1",  items: ["Sate Kambing", "Nasi Putih"],            status: "selesai", time: "15 menit lalu" },
  { id: "ORD-004", table: "Take Away",items: ["Mie Goreng", "Es Jeruk"],               status: "baru",    time: "1 menit lalu" },
  { id: "ORD-005", table: "Meja 5",  items: ["Pizza Margherita", "Coca-Cola"],         status: "proses",  time: "12 menit lalu" },
];

const STATUS_CONFIG = {
  baru:    { label: "Pesanan Baru",   bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-500 text-white",     icon: AlertCircle,   dot: "bg-amber-400" },
  proses:  { label: "Diproses",       bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-500 text-white",      icon: Timer,         dot: "bg-blue-400" },
  selesai: { label: "Selesai",        bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-500 text-white",     icon: CheckCircle2,  dot: "bg-green-400" },
} as const;

type OrderStatus = keyof typeof STATUS_CONFIG;

export default function KitchenDisplayPage() {
  const grouped = DUMMY_ORDERS.reduce(
    (acc, o) => {
      const s = o.status as OrderStatus;
      if (!acc[s]) acc[s] = [];
      acc[s].push(o);
      return acc;
    },
    {} as Record<OrderStatus, typeof DUMMY_ORDERS>,
  );

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
          <ChefHat className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kitchen Display System</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live — {DUMMY_ORDERS.length} pesanan aktif
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* KDS Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["baru", "proses", "selesai"] as OrderStatus[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const orders = grouped[status] ?? [];
          const StatusIcon = cfg.icon;

          return (
            <div key={status} className="flex flex-col gap-4">
              {/* Column header */}
              <div className="flex items-center gap-2">
                <StatusIcon className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm text-foreground">{cfg.label}</h2>
                <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {orders.length}
                </span>
              </div>

              {/* Order cards */}
              {orders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">Tidak ada pesanan</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className={`rounded-2xl border ${cfg.bg} ${cfg.border} p-5 space-y-3 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{order.id}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{order.table}</p>
                      <ul className="space-y-1">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-2">
                      {order.time}
                    </p>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
