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
 * - staleTime: 5 minutes — avoids repeated fetches on quick navigation
 * - retry: 1 — one retry on transient failure
 * - enabled: always enabled when the hook is mounted
 */
export function useCurrentUserQuery() {
  return useQuery<CurrentUserData, Error>({
    queryKey: currentUserQueryKeys.currentUser(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1_000,
    retry: 1,
  });
}
