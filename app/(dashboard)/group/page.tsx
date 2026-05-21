import type { Metadata } from "next";
import {
  UtensilsCrossed,
  Building2,
  BarChart3,
  PackageSearch,
  Users,
} from "lucide-react";
import { PageHeader, DashboardCard } from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "Dashboard — Manajemen Grup | XYZ POS",
  description: "Pusat kendali grup XYZ untuk seluruh unit bisnis.",
};

export default function ManajemenGrupDashboard() {
  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Selamat datang di Sistem POS manajemen Grup XYZ"
      />

      {/* ── Feature cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <DashboardCard
          icon={UtensilsCrossed}
          title="Kelola Menu"
          description="Kelola daftar produk & harga yang tersedia di seluruh unit"
          href="/group/menu"
        />
        <DashboardCard
          icon={Building2}
          title="Kelola Unit"
          description="Pantau & kelola menu seluruh Unit Usaha Grup XYZ"
          href="/group/unit"
        />
        <DashboardCard
          icon={BarChart3}
          title="Monitoring Laporan"
          description="Pantau performa penjualan & omzet seluruh unit secara real-time"
          href="/group/laporan"
        />
        <DashboardCard
          icon={PackageSearch}
          title="Kelola Inventaris"
          description="Pantau stok bahan baku & ketersediaan di setiap unit"
          href="/group/inventaris"
        />
        <DashboardCard
          icon={Users}
          title="Kelola Pengguna"
          description="Atur akun & hak akses pengguna di seluruh unit bisnis"
          href="/group/pengguna"
        />
        <DashboardCard
          icon={Users}
          title="Riwayat Transaksi"
          description="Lihat dan kelola riwayat transaksi di seluruh unit bisnis"
          href="/group/transaksi"
        />
      </div>
    </div>
  );
}
