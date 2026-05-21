"use client";

import React, { useEffect } from "react";
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
  ChevronRight,
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
import { Skeleton } from "@/components/ui/skeleton";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useCurrentUserContextState } from "@/components/dashboard/current-user-context";
import { signOut, useSession } from "next-auth/react";
import { ROLE_NAV, type NavItem } from "@/lib/constants/navigation";
import { getDashboardRoute, type RoleCode } from "@/lib/constants/roles";
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

function SidebarLoadingSkeleton() {
  const menuSkeletonWidths = [
    "w-[72%]",
    "w-[64%]",
    "w-[58%]",
    "w-[82%]",
    "w-[67%]",
    "w-[74%]",
  ];

  return (
    <Sidebar collapsible="icon" className="bg-[#F1EEE9]">
      <SidebarHeader className="px-5 pt-7 pb-6 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary shadow-[0_4px_14px_color-mix(in_srgb,var(--primary)_28%,transparent)] group-data-[collapsible=icon]:size-9">
            <UtensilsCrossed size={17} className="text-primary-foreground" />
          </div>

          <div className="min-w-0 flex-1 space-y-2 group-data-[collapsible=icon]:hidden">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 gap-0">
              {menuSkeletonWidths.map((widthClass, index) => (
                <SidebarMenuItem key={index}>
                  <div className="flex h-8 items-center gap-2 rounded-md px-2 group-data-[collapsible=icon]:justify-center">
                    <Skeleton className="size-4 rounded-md" />
                    <Skeleton
                      className={`h-4 ${widthClass} group-data-[collapsible=icon]:hidden`}
                    />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

/* ─── AppSidebar ────────────────────────────────────────────────────────────── */
export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isError, refetchCurrentUser } =
    useCurrentUserContextState();
  const { data: session } = useSession();
  const user = useCurrentUser();
  const roleCode =
    user?.role?.role_code ?? (session?.user?.role_code as RoleCode | undefined);
  const resolvedRoleCode = roleCode as RoleCode | undefined;
  const navItems: NavItem[] = resolvedRoleCode
    ? (ROLE_NAV[resolvedRoleCode] ?? [])
    : [];

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

  useEffect(() => {
    refetchCurrentUser();
  }, [pathname, refetchCurrentUser]);

  useEffect(() => {
    if (!roleCode) return;

    const dashboardPath = getDashboardRoute(roleCode);
    const isGroupPath = pathname.startsWith("/group");
    const isUnitPath = pathname.startsWith("/unit");
    const isGroupDashboard = dashboardPath.startsWith("/group");
    const isUnitDashboard = dashboardPath.startsWith("/unit");

    if (
      (isGroupPath && !isGroupDashboard) ||
      (isUnitPath && !isUnitDashboard)
    ) {
      router.replace(dashboardPath);
    }
  }, [pathname, roleCode, router]);

  if (isLoading && !user) {
    return <SidebarLoadingSkeleton />;
  }

  if (isError && !user && !session?.user?.role_code) {
    return (
      <Sidebar collapsible="icon" className="bg-[#F1EEE9]">
        <SidebarHeader className="px-5 pt-7 pb-6 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary shadow-[0_4px_14px_color-mix(in_srgb,var(--primary)_28%,transparent)] group-data-[collapsible=icon]:size-9">
              <UtensilsCrossed size={17} className="text-primary-foreground" />
            </div>

            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-base font-bold text-foreground tracking-tight leading-none">
                Sistem POS XYZ
              </p>
              <p className="text-xs text-muted-foreground mt-2 truncate font-medium">
                Gagal memuat profil pengguna
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-3">
            <SidebarGroupContent>
              <p className="px-2 py-2 text-[12px] text-muted-foreground">
                Menu tidak tersedia sementara.
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Logout"
                className="text-destructive focus:text-destructive focus:bg-destructive/10 group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="w-4 h-4 shrink-0 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Logout
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="bg-[#F1EEE9]">
      {/* ── Brand header ──────────────────────────── */}
      <SidebarHeader className="px-5 pt-7 pb-6 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          {/* Logo mark — bg-primary → var(--primary) #49111C */}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary shadow-[0_4px_14px_color-mix(in_srgb,var(--primary)_28%,transparent)] group-data-[collapsible=icon]:size-9">
            <UtensilsCrossed size={17} className="text-primary-foreground" />
          </div>

          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
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
        <SidebarGroup className="px-2">
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
                  <div className="flex flex-col gap-0.5 leading-none min-w-0 group-data-[collapsible=icon]:hidden">
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

                  <ChevronsUpDown className="ml-auto w-4 h-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
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
