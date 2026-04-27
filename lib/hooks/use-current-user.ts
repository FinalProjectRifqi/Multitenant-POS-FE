"use client";

import { useState } from "react";
import { userStorage } from "@/lib/api/auth";
import type { User } from "@/lib/types/auth";

/**
 * useCurrentUser — reads the authenticated user from localStorage.
 * Returns null during SSR and before hydration.
 */
export function useCurrentUser(): User | null {
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return userStorage.get();
  });

  return user;
}
