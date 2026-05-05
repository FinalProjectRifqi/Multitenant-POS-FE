"use client";

import React, { createContext, useContext } from "react";
import { useCurrentUserQuery } from "@/lib/queries/current-user";
import type { CurrentUserData } from "@/lib/types/auth";

// ─── Context ──────────────────────────────────────────────────────────────────

interface CurrentUserContextValue {
  currentUser: CurrentUserData | null;
  isLoading: boolean;
  isError: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  currentUser: null,
  isLoading: false,
  isError: false,
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
  const { data, isLoading, isError } = useCurrentUserQuery();

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser: data ?? null,
        isLoading,
        isError,
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
