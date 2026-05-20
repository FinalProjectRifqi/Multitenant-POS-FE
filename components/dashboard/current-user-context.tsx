"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { useCurrentUserQuery } from "@/lib/queries/current-user";
import type { CurrentUserData } from "@/lib/types/auth";

// ─── Context ──────────────────────────────────────────────────────────────────

interface CurrentUserContextValue {
  currentUser: CurrentUserData | null;
  isLoading: boolean;
  isError: boolean;
  refetchCurrentUser: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  currentUser: null,
  isLoading: false,
  isError: false,
  refetchCurrentUser: () => undefined,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * CurrentUserProvider — wraps the dashboard layout to provide `currentUser` (current user profile)
 * to all dashboard client components via context.
 *
 * Data is fetched once from GET /auth/me and shared globally — no prop-drilling needed.
 */
export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading, isError, refetch } = useCurrentUserQuery();
  const { data: session, update } = useSession();

  useEffect(() => {
    if (!data) return;

    const latestRoleCode = data.role_code;
    const latestUnitId = data.business_units?.[0]?.business_unit_id ?? null;
    const sessionRoleCode = session?.user?.role_code;
    const sessionUnitId = session?.user?.unit_id ?? null;

    if (latestRoleCode === sessionRoleCode && latestUnitId === sessionUnitId) {
      return;
    }

    void update({
      role_code: latestRoleCode,
      unit_id: latestUnitId,
    });
  }, [data, session?.user?.role_code, session?.user?.unit_id, update]);

  const refetchCurrentUser = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser: data ?? null,
        isLoading,
        isError,
        refetchCurrentUser,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useCurrentUser — returns the current authenticated user's full profile.
 *
 * Returns null when:
 *   - Data is still loading
 *   - The /auth/me request failed
 *
 * Must be used inside a component tree wrapped with <CurrentUserProvider>.
 */
export function useCurrentUserContext(): CurrentUserData | null {
  const { currentUser } = useContext(CurrentUserContext);
  return currentUser;
}

export function useCurrentUserContextState(): CurrentUserContextValue {
  return useContext(CurrentUserContext);
}
