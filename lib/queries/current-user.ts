"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/api/current-user";
import type { CurrentUserData } from "@/lib/types/auth";

export const currentUserQueryKeys = {
  currentUser: () => ["currentUser"] as const,
};

/**
 * useCurrentUserQuery — fetches /auth/me and returns the full profile of the
 * currently authenticated user.
 *
 * - staleTime: 0 — keep data stale so focus-triggered sync is always fresh
 * - retry: 1 — one retry on transient failure
 * - refetchOnWindowFocus: true — sync profile/role when user returns to tab
 */
export function useCurrentUserQuery() {
  return useQuery<CurrentUserData, Error>({
    queryKey: currentUserQueryKeys.currentUser(),
    queryFn: fetchCurrentUser,
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
