"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { isPathAllowedForRole } from "@/lib/constants/navigation";
import { getDashboardRoute, type RoleCode } from "@/lib/constants/roles";
import { useCurrentUserContextState } from "@/components/dashboard/current-user-context";

interface RoleRouteGuardProps {
  children: ReactNode;
}

export function RoleRouteGuard({ children }: RoleRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const { data: session, status } = useSession();
  const { isLoading } = useCurrentUserContextState();
  const roleCode = (user?.role?.role_code ??
    session?.user?.role_code) as RoleCode | undefined;

  const isRolePending = !roleCode && (isLoading || status === "loading");
  const isAllowed = isPathAllowedForRole(roleCode, pathname);

  useEffect(() => {
    if (isRolePending || !roleCode || isAllowed) return;

    router.replace(getDashboardRoute(roleCode));
  }, [isAllowed, isRolePending, pathname, roleCode, router]);

  if (isRolePending) return null;
  if (roleCode && !isAllowed) return null;

  return children;
}
