"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * SessionExpiryWatcher
 *
 * Client component that reads the `exp` claim from the access_token stored in
 * the NextAuth session, then schedules a timer to:
 *   1. Show a sonner toast warning the user their session has expired.
 *   2. Redirect to `/login?callbackUrl=<current_path>` so they land back on the
 *      same page after re-authenticating.
 *
 * Mount this once in the dashboard layout — it renders nothing to the DOM.
 */
export function SessionExpiryWatcher() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any previously scheduled timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (status !== "authenticated" || !session?.user?.access_token) return;

    try {
      const parts = session.user.access_token.split(".");
      if (parts.length !== 3) return;

      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { exp?: number };

      if (!payload.exp) return;

      const msUntilExpiry = payload.exp * 1000 - Date.now();

      // If already expired (e.g., the page was open for a long time), act now.
      if (msUntilExpiry <= 0) {
        handleExpiry();
        return;
      }

      timerRef.current = setTimeout(() => {
        handleExpiry();
      }, msUntilExpiry);
    } catch {
      // Ignore decode errors — session will expire naturally via NextAuth
    }

    function handleExpiry() {
      toast.error("Sesi Anda telah berakhir", {
        description: "Silakan login kembali untuk melanjutkan.",
        position: "top-right",
        richColors: true,
        duration: 4000,
      });
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // Re-run whenever the session or pathname changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.access_token, status]);

  return null;
}
