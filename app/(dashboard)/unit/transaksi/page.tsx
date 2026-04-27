import type { Metadata } from "next";
import { ClipboardList, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PageHeader, StatsCard } from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "Riwayat Transaksi | XYZ POS",
};

const TRANSACTIONS = [
  { id: "TRX-20240427-001", table: "Meja 3",   items: 3, total: 98000,  status: "selesai",  time: "08:32" },
  { id: "TRX-20240427-002", table: "Take Away", items: 2, total: 47000,  status: "selesai",  time: "09:05" },
  { id: "TRX-20240427-003", table: "Meja 7",   items: 5, total: 185000, status: "selesai",  time: "09:41" },
  { id: "TRX-20240427-004", table: "Meja 1",   items: 1, total: 35000,  status: "dibatalkan", time: "10:12" },
  { id: "TRX-20240427-005", table: "Meja 5",   items: 4, total: 132000, status: "selesai",  time: "10:55" },
  { id: "TRX-20240427-006", table: "Take Away", items: 2, total: 58000,  status: "selesai",  time: "11:20" },
];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function RiwayatTransaksiPage() {
  return (
    <div className="p-8">
      <PageHeader title="Riwayat Transaksi" description="Seluruh riwayat transaksi hari ini" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={ClipboardList} label="Total Transaksi"  value="6"          trend="hari ini"          trendUp={true} />
        <StatsCard icon={TrendingUp}    label="Total Pendapatan" value="Rp 555 rb"   trend="dari 5 transaksi" trendUp={true} />
        <StatsCard icon={ArrowDownLeft} label="Dibatalkan"       value="1"           trend="hari ini"          trendUp={false} />
        <StatsCard icon={ArrowUpRight}  label="Rata-rata Order"  value="Rp 92,5 rb" trend="per transaksi"     trendUp={true} />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Daftar Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">ID Transaksi</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Meja</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Waktu</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((trx) => (
                <tr key={trx.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-foreground">{trx.id}</td>
                  <td className="px-4 py-4 text-muted-foreground">{trx.table}</td>
                  <td className="px-4 py-4 text-muted-foreground">{trx.items} item</td>
                  <td className="px-4 py-4 font-semibold text-foreground">{formatRupiah(trx.total)}</td>
                  <td className="px-4 py-4 text-muted-foreground">{trx.time}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        trx.status === "selesai"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${trx.status === "selesai" ? "bg-green-500" : "bg-red-400"}`} />
                      {trx.status === "selesai" ? "Selesai" : "Dibatalkan"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
