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

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isPathAllowedForRole(
  roleCode: RoleCode | undefined,
  pathname: string,
): boolean {
  if (!roleCode) return false;

  return (ROLE_NAV[roleCode] ?? []).some((item) =>
    isNavItemActive(item, pathname),
  );
}
