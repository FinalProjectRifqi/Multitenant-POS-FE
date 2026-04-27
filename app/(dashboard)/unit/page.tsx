import type { Metadata } from "next";
import { BarChart3, PackageSearch, ClipboardList, TrendingUp } from "lucide-react";
import { PageHeader, DashboardCard, StatsCard } from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "Dashboard — Manajer Unit | XYZ POS",
  description: "Dashboard monitoring unit untuk Manajer Unit XYZ.",
};

export default function ManajerUnitDashboard() {
  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Pantau performa & operasional unit Anda"
      />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={TrendingUp}    label="Omzet Hari Ini"  value="Rp 3,2 jt"  trend="12% dari kemarin" trendUp={true} />
        <StatsCard icon={ClipboardList} label="Transaksi"        value="48"          trend="5 transaksi tadi" trendUp={true} />
        <StatsCard icon={PackageSearch} label="Stok Kritis"      value="2 item"      trend="perlu restock"    trendUp={false} />
        <StatsCard icon={BarChart3}     label="Rata-rata Order"  value="Rp 66 rb"    trend="dari Rp 61 rb"    trendUp={true} />
      </div>

      {/* ── Feature cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <DashboardCard
          icon={BarChart3}
          title="Monitoring Laporan"
          description="Pantau performa penjualan & omzet unit secara real-time"
          href="/dashboard/unit/laporan"
        />
        <DashboardCard
          icon={PackageSearch}
          title="Kelola Inventaris"
          description="Pantau stok bahan baku & ketersediaan di unit Anda"
          href="/dashboard/unit/inventaris"
        />
        <DashboardCard
          icon={ClipboardList}
          title="Riwayat Transaksi"
          description="Lihat & ekspor seluruh riwayat transaksi unit"
          href="/dashboard/unit/transaksi"
        />
      </div>
    </div>
  );
}
