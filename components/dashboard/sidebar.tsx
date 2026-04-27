"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ShoppingBag,
  ChevronsUpDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { logout } from "@/lib/api/auth";
import { ROLE_NAV, type NavItem } from "@/lib/constants/navigation";
import { ROLE_CODE, type RoleCode } from "@/lib/constants/roles";

// ─── Icon registry ──────────────────────────────────────────────────────────────
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

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}

// ─── Role badge ─────────────────────────────────────────────────────────────────
const ROLE_BADGE: Record<
  RoleCode,
  { bg: string; text: string; label: string }
> = {
  [ROLE_CODE.MANAJEMEN_GRUP]: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Manajemen Grup",
  },
  [ROLE_CODE.TIM_DAPUR]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    label: "Tim Dapur",
  },
  [ROLE_CODE.MANAJER_UNIT]: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    label: "Manajer Unit",
  },
  [ROLE_CODE.STAF_UNIT]: {
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Staf Unit",
  },
};

// ─── Nav item — square active style (image 2) ───────────────────────────────────
function NavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        className="rounded-md data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground group-data-[collapsible=icon]:justify-center!"
      >
        <Link href={item.href}>
          <NavIcon name={item.icon} />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ─── App Sidebar ────────────────────────────────────────────────────────────────
export function AppSidebar() {
  const router = useRouter();
  const user = useCurrentUser();

  const roleCode = (user?.role?.role_code ?? "") as RoleCode;
  const navItems = ROLE_NAV[roleCode] ?? [];
  const badge = ROLE_BADGE[roleCode];

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <Sidebar collapsible="icon">
      {/* ── Brand header ── */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="pointer-events-none select-none"
              tooltip="Sistem POS XYZ"
            >
              {/* <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm shrink-0">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div> */}
              <div className="flex flex-col gap-1 leading-none min-w-0 px-2">
                <span className="font-bold text-base truncate">
                  Sistem POS XYZ
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.unit?.unit_name ?? "Manajemen Grup XYZ"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="p-2 flex flex-col gap-2">
              {navItems.length > 0 ? (
                navItems.map((item) => <NavItem key={item.href} item={item} />)
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Tidak ada menu tersedia.
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: user dropdown (image 3 style) ── */}
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-sm">
                    {initials}
                  </div>

                  {/* Name + badge */}
                  <div className="flex flex-col gap-0.5 leading-none min-w-0 flex-1">
                    <span className="text-sm font-semibold truncate">
                      {user?.full_name ?? "—"}
                    </span>
                    {badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-px rounded-full w-fit ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    )}
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
                    {badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-px rounded-full w-fit ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    )}
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
