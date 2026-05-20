"use server";

import { apiGet } from "@/lib/api/client";
import type { CurrentUserApiResponse, CurrentUserData } from "@/lib/types/auth";

const CURRENT_USER_ENDPOINT = "/auth/me";

/**
 * Fetches the current authenticated user's full profile from the backend.
 * Uses the server-side apiGet helper which automatically attaches the
 * Authorization: Bearer header from the current session.
 *
 * Throws on non-2xx responses (error is prefixed with "[STATUS] message"
 * by the axios interceptor in client.ts).
 */
export async function fetchCurrentUser(): Promise<CurrentUserData> {
  const res = await apiGet<CurrentUserApiResponse>(CURRENT_USER_ENDPOINT);
  return res.data;
}
