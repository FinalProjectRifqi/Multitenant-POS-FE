import { ROLE_CODE, type RoleCode } from "@/lib/constants/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  exact?: boolean;
}

export const ROLE_NAV: Record<RoleCode, NavItem[]> = {
  [ROLE_CODE.MANAJEMEN_GRUP]: [
    {
      label: "Dashboard",
      href: "/group",
      icon: "LayoutDashboard",
      exact: true,
    },
    { label: "Kelola Menu", href: "/group/menu", icon: "UtensilsCrossed" },
    { label: "Kelola Unit", href: "/group/unit", icon: "Building2" },
    { label: "Monitoring Laporan", href: "/group/laporan", icon: "BarChart3" },
    {
      label: "Kelola Inventaris",
      href: "/group/inventaris",
      icon: "PackageSearch",
    },
    { label: "Kelola Pengguna", href: "/group/pengguna", icon: "Users" },
    {
      label: "Riwayat Transaksi",
      href: "/group/transaksi",
      icon: "ClipboardList",
    },
  ],

  [ROLE_CODE.TIM_DAPUR]: [
    { label: "Kitchen Display System", href: "/unit/kitchen", icon: "ChefHat" },
    {
      label: "Inventaris Harian",
      href: "/unit/inventaris/harian",
      icon: "ClipboardCheck",
    },
    {
      label: "Kelola Menu",
      href: "/unit/menu",
      icon: "UtensilsCrossed",
    },
  ],

  [ROLE_CODE.MANAJER_UNIT]: [
    { label: "Dashboard", href: "/unit", icon: "LayoutDashboard", exact: true },
    { label: "Monitoring Laporan", href: "/unit/laporan", icon: "BarChart3" },
    {
      label: "Kelola Inventaris",
      href: "/unit/inventaris",
      icon: "PackageSearch",
    },
    {
      label: "Inventaris Harian",
      href: "/unit/inventaris/harian",
      icon: "ClipboardCheck",
    },
    {
      label: "Riwayat Transaksi",
      href: "/unit/transaksi",
      icon: "ClipboardList",
    },
  ],

  [ROLE_CODE.STAF_UNIT]: [
    { label: "Dashboard", href: "/unit", icon: "LayoutDashboard", exact: true },
    { label: "Kelola Pesanan", href: "/unit/pos", icon: "ShoppingCart" },
    {
      label: "Riwayat Transaksi",
      href: "/unit/transaksi",
      icon: "ClipboardList",
    },
    {
      label: "Proses Pembayaran",
      href: "/unit/pembayaran",
      icon: "CreditCard",
    },
  ],
};
