"use client";

/**
 * handle-api-error.ts — Client-side error handler for Server Action errors.
 *
 * Server Actions convert AxiosErrors into plain `Error` objects with a
 * "[STATUS] message" format (see client.ts interceptor). This module:
 *   1. Parses the [STATUS] prefix to determine HTTP status code
 *   2. Branches on status to show the appropriate toast and/or side-effect
 *      - [0]   → network / no-connection error
 *      - [400] → validation / bad request  → show detail message
 *      - [401] → unauthenticated           → toast + signOut → /login
 *      - [404] → not found                 → show backend message
 *      - [5xx] → server error              → show backend message (or generic)
 *      - other → show message as-is
 *
 * Usage in React Query onError:
 *   onError: (error) => handleApiError(error)
 */

import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { parseApiError } from "@/lib/api/parsed-api-error";

// ─── Types ─────────────────────────────────────────────────────────────────────

// ─── Toast options ─────────────────────────────────────────────────────────────

const TOAST_OPTIONS = {
  position: "top-right",
  richColors: true,
  duration: 3000,
} as const;

const TOAST_DEDUP_WINDOW_MS = 1_500;
const recentToastTimestamps = new Map<string, number>();
let is401SignOutInProgress = false;

function buildToastKey(status: number, title: string, message: string): string {
  return `${status}|${title}|${message}`;
}

function shouldSkipDuplicateToast(key: string): boolean {
  const now = Date.now();
  const lastShownAt = recentToastTimestamps.get(key);

  if (
    typeof lastShownAt === "number" &&
    now - lastShownAt < TOAST_DEDUP_WINDOW_MS
  ) {
    return true;
  }

  recentToastTimestamps.set(key, now);

  // Keep map small by removing old entries.
  for (const [toastKey, shownAt] of recentToastTimestamps.entries()) {
    if (now - shownAt >= TOAST_DEDUP_WINDOW_MS * 4) {
      recentToastTimestamps.delete(toastKey);
    }
  }

  return false;
}

function showErrorToast(status: number, title: string, message: string): void {
  const toastKey = buildToastKey(status, title, message);
  if (shouldSkipDuplicateToast(toastKey)) {
    return;
  }

  toast.error(title, {
    id: toastKey,
    description: message,
    ...TOAST_OPTIONS,
  });
}

// ─── Main handler ──────────────────────────────────────────────────────────────

/**
 * Handles an error thrown by a Server Action.
 *
 * @param error  - The error thrown from `mutationFn` / `queryFn`
 * @param title  - Optional custom toast title (overrides default per-status title).
 *                 When provided, the backend message is shown as the description.
 */
export function handleApiError(
  error: unknown,
  options?: { title?: string },
): void {
  // This handler is intended for client runtime (toast + signOut side effects).
  if (typeof window === "undefined") {
    return;
  }

  const { status, message } = parseApiError(error);

  // ── Network / no response ───────────────────────────────────────────────────
  if (status === 0) {
    showErrorToast(status, options?.title ?? "Tidak dapat terhubung", message);
    return;
  }

  // ── 401 Unauthenticated ─────────────────────────────────────────────────────
  if (status === 401) {
    showErrorToast(status, options?.title ?? "Sesi berakhir", message);

    // Delay signOut slightly so the toast is visible before navigation
    if (!is401SignOutInProgress) {
      is401SignOutInProgress = true;
      setTimeout(() => {
        void signOut({ callbackUrl: "/login" });
      }, TOAST_DEDUP_WINDOW_MS);
    }

    return;
  }

  // ── 400 Validation / Bad Request ────────────────────────────────────────────
  if (status === 400 || status === 422) {
    showErrorToast(status, options?.title ?? "Data tidak valid", message);
    return;
  }

  // ── 404 Not Found ───────────────────────────────────────────────────────────
  if (status === 404) {
    showErrorToast(status, options?.title ?? "Data tidak ditemukan", message);
    return;
  }

  // ── 5xx Server Error ────────────────────────────────────────────────────────
  if (status >= 500) {
    showErrorToast(status, options?.title ?? "Kesalahan server", message);
    return;
  }

  // ── Catch-all (403, 409, etc.) ──────────────────────────────────────────────
  showErrorToast(status, options?.title ?? "Permintaan gagal", message);
}

export function shouldHandleMutationErrorGlobally(error: unknown): boolean {
  const { status } = parseApiError(error);
  return status === 0 || status === 401 || status === 403 || status >= 500;
}
