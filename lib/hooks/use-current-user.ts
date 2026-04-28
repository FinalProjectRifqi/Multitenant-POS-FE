"use client";

import { useSession } from "next-auth/react";
import type { User } from "@/lib/types/auth";

/**
 * useCurrentUser — returns the authenticated user reconstructed from the
 * NextAuth JWT session.
 *
 * Returns null when:
 *   - Session is still loading  (status === "loading")
 *   - User is not authenticated (status === "unauthenticated")
 *
 * Because NextAuth's SessionProvider initialises with `data = null` on both
 * server AND client, this hook is fully hydration-safe — no more
 * "server/client mismatch" errors from localStorage reads.
 */
export function useCurrentUser(): User | null {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const u = session.user;
  const now = new Date().toISOString();

  // Re-construct the nested User shape expected by existing components
  // (sidebar uses user?.role?.role_code and user?.unit?.unit_name)
  return {
    user_id: u.user_id,
    role_id: u.role_id,
    full_name: u.full_name,
    username: u.username,
    email: u.email ?? "",
    last_login_at: null,
    is_active: true,
    created_at: now,
    updated_at: now,
    role: {
      role_id: u.role_id,
      role_name: u.role_name,
      role_code: u.role_code,
      description: "",
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    unit: u.unit_name
      ? {
          unit_id: u.unit_id ?? "",
          unit_name: u.unit_name,
          unit_address: "",
          phone_number: "",
          status: "active",
          created_at: now,
          updated_at: now,
        }
      : null,
  };
}
