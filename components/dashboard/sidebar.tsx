"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Building2,
  BarChart3,
  PackageSearch,
  Users,
  ClipboardList,
  ChefHat,
  ShoppingCart,
  CreditCard,
  LogOut,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { signOut } from "next-auth/react";
import { ROLE_NAV, type NavItem } from "@/lib/constants/navigation";
import { ROLE_CODE, type RoleCode } from "@/lib/constants/roles";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

/* ─── Icon registry ─────────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  UtensilsCrossed,
  Building2,
  BarChart3,
  PackageSearch,
  Users,
  ClipboardList,
  ChefHat,
  ShoppingCart,
  CreditCard,
};

function NavIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon />;
}

/* ─── Role badge — uses globals.css tokens via Tailwind ─────────────────────── */
const ROLE_BADGE: Record<RoleCode, { className: string; label: string }> = {
  [ROLE_CODE.MANAJEMEN_GRUP]: {
    className: "bg-primary/10 text-primary",
    label: "Manajemen Grup",
  },
  [ROLE_CODE.TIM_DAPUR]: {
    className: "bg-orange-500/10 text-orange-800",
    label: "Tim Dapur",
  },
  [ROLE_CODE.MANAJER_UNIT]: {
    className: "bg-blue-600/10 text-blue-800",
    label: "Manajer Unit",
  },
  [ROLE_CODE.STAF_UNIT]: {
    className: "bg-green-600/10 text-green-800",
    label: "Staf Unit",
  },
};

/* ─── Single nav item ───────────────────────────────────────────────────────── */
function NavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className={[
          // base
          "rounded-md h-auto py-2.5 px-3 transition-colors duration-150",
          "border-l-4 border-transparent",
          // text + icon defaults
          "text-[13px] text-muted-foreground",
          "[&>svg]:size-3.75 [&>svg]:shrink-0 [&>svg]:stroke-[1.75px]",
          // hover (not active)
          "hover:bg-primary/4 hover:text-foreground",
          // active overrides — data-[active=true] is set by SidebarMenuButton
          "data-[active=true]:bg-primary/7 data-[active=true]:text-foreground",
          "data-[active=true]:font-semibold data-[active=true]:border-l-primary",
          "data-[active=true]:[&>svg]:stroke-[2.2px] data-[active=true]:[&>svg]:text-primary",
        ].join(" ")}
      >
        <Link href={item.href} className="flex items-center gap-3 w-full">
          <NavIcon name={item.icon} />
          <span className="flex-1 text-left">{item.label}</span>
          {isActive && (
            <ChevronRight className="size-3! text-primary/50 shrink-0" />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/* ─── AppSidebar ────────────────────────────────────────────────────────────── */
export function AppSidebar() {
  const user = useCurrentUser();
  const roleCode = (user?.role?.role_code ?? "") as RoleCode;
  const navItems = ROLE_NAV[roleCode] ?? [];
  // const badge = ROLE_BADGE[roleCode];

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Sidebar collapsible="icon" className="bg-[#F1EEE9]">
      {/* ── Brand header ──────────────────────────── */}
      <SidebarHeader className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          {/* Logo mark — bg-primary → var(--primary) #49111C */}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary shadow-[0_4px_14px_color-mix(in_srgb,var(--primary)_28%,transparent)]">
            <UtensilsCrossed size={17} className="text-primary-foreground" />
          </div>

          <div className="min-w-0">
            {/* text-foreground → var(--foreground) */}
            <p className="text-base font-bold text-foreground tracking-tight leading-none">
              Sistem POS XYZ
            </p>
            {/* text-muted-foreground → var(--muted-foreground) */}
            <p className="text-xs text-muted-foreground mt-2 truncate font-medium">
              {user?.unit?.unit_name ?? "Manajemen Grup XYZ"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navigation ────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            {navItems.length > 0 ? (
              <SidebarMenu className="space-y-0.5 gap-0">
                {navItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </SidebarMenu>
            ) : (
              <p className="px-2 py-2 text-[12px] text-muted-foreground">
                Tidak ada menu tersedia.
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: user info + logout ────────────── */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user?.full_name ?? "Akun"}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {user?.full_name ?? "—"}
                    </span>
                    <span className="text-xs font-light truncate">
                      {user?.role?.role_name ?? "—"}
                    </span>
                    {/* {badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-px rounded-full w-fit ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    )} */}
                  </div>

                  <ChevronsUpDown className="ml-auto w-4 h-4 shrink-0 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {/* Dropdown — opens upward, anchored to sidebar width */}
              <DropdownMenuContent
                side="top"
                align="center"
                className="w-[--radix-popper-anchor-width] min-w-56"
              >
                {/* User info header inside dropdown */}
                <DropdownMenuLabel className="flex items-center gap-3 p-3 font-normal">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {user?.full_name ?? "—"}
                    </span>
                    <span className="text-xs font-light truncate">
                      {user?.role?.role_name ?? "—"}
                    </span>
                    {/* {badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-px rounded-full w-fit ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    )} */}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2 shrink-0" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
