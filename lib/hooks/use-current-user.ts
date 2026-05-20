"use client";

import { useCurrentUserContext } from "@/components/dashboard/current-user-context";
import type { User } from "@/lib/types/auth";

/**
 * useCurrentUser — returns the authenticated user reconstructed from /auth/me.
 *
 * This hook is a thin adapter over useMe() that maps the flat MeData shape
 * to the nested User shape expected by existing components
 * (sidebar uses user?.role?.role_code and user?.unit?.unit_name).
 *
 * Returns null when:
 *   - /auth/me is still loading
 *   - /auth/me request failed
 */
export function useCurrentUser(): User | null {
  const currentUser = useCurrentUserContext();

  if (!currentUser) return null;

  const now = new Date().toISOString();
  const primaryUnit = currentUser.business_units?.[0] ?? null;

  return {
    user_id: currentUser.user_id,
    role_id: currentUser.role_id ?? "",
    full_name: currentUser.full_name,
    username: currentUser.user_name,
    email: currentUser.email,
    last_login_at: currentUser.last_login,
    is_active: currentUser.status === "active",
    created_at: now,
    updated_at: now,
    role: {
      role_id: currentUser.role_id ?? "",
      role_name: currentUser.role_name ?? "",
      role_code: currentUser.role_code,
      description: "",
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    unit: primaryUnit
      ? {
          unit_id: primaryUnit.business_unit_id,
          unit_name: primaryUnit.business_unit_name,
          unit_address: "",
          phone_number: "",
          status: "active",
          created_at: now,
          updated_at: now,
        }
      : null,
  };
}
