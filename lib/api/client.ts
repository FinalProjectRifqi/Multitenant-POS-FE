/**
 * client.ts — Server-side HTTP client for use inside Server Actions.
 *
 *
 * ⚠️  Import this file ONLY from files marked "use ".
 *     For client-side React Query hooks, keep using lib/api/client.ts.
 */

import axios, { AxiosHeaders, type AxiosRequestConfig } from "axios";
import type { ZodType } from "zod";
import { validateSchema } from "@/lib/api/validator";
import { auth } from "@/lib/nextauth/auth";

const DEFAULT_TIMEOUT_IN_MS = 15_000;

// Backend base URL — strip trailing slash to keep endpoint paths clean.
const BASE_URL = (process.env.API_BASE_URL ?? "").replace(/\/$/, "");

// ─── Axios instance ────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_IN_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Accept", "application/json");

  // auth() reads the JWT session from the httpOnly cookie -side.
  // Safe to call inside Server Actions — Next.js caches the call per request.
  const session = await auth();
  if (session?.user?.access_token) {
    headers.set("Authorization", `Bearer ${session.user.access_token}`);
  }

  config.headers = headers;
  return config;
});

/**
 * Extracts a human-readable message from a backend error payload.
 * Backend standard envelope: { success: false, error: { code, message, details } }
 */
function extractPayloadMessage(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (payload !== null && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const errorObj = p.error;

    if (errorObj && typeof errorObj === "object") {
      const e = errorObj as Record<string, unknown>;

      // Validation error: extract all constraint messages from details[]
      const details = e.details;
      if (Array.isArray(details) && details.length > 0) {
        const msgs = details.flatMap((d: unknown) => {
          if (!d || typeof d !== "object") return [];
          const constraints = (d as Record<string, unknown>).constraints;
          if (!constraints || typeof constraints !== "object") return [];
          return Object.values(constraints).filter(
            (v): v is string => typeof v === "string",
          );
        });
        if (msgs.length > 0) return msgs.join(", ");
      }

      // Non-validation / generic error: use error.message from envelope
      if (typeof e.message === "string") return e.message;
    }

    // Defensive fallback: flat { message: "..." } format
    if (typeof p.message === "string") return p.message;
  }

  return null;
}

// Convert Axios/HTTP errors into plain Error objects.
// Server Actions must throw serialisable values — AxiosError is not serialisable.
// Status code is encoded as a "[STATUS]" prefix so client-side handlers can
// branch on it (e.g. show a logout toast on 401) without needing AxiosError.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const payload = error.response?.data;

      // 0 = no response (network error, timeout, CORS, etc.)
      if (status === 0 || !error.response) {
        throw new Error(
          "[0] Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        );
      }

      // Extract human-readable message from response body
      const bodyMessage = extractPayloadMessage(payload);
      // Fallback to Axios generic message if body has no readable message
      const message = bodyMessage ?? error.message;

      // Prefix with [STATUS] so client handlers can detect status without
      // needing AxiosError (which is not serialisable across Server Action boundary)
      throw new Error(`[${status}] ${message}`);
    }

    // Re-throw non-Axios errors as-is (already serialisable)
    throw error;
  },
);

// ─── Types ─────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions<TParams = Record<string, unknown>> = Omit<
  AxiosRequestConfig,
  "method" | "url" | "data" | "params"
> & {
  params?: TParams;
};

export type ApiRequestWithSchemaOptions<
  TData,
  TParams = Record<string, unknown>,
> = ApiRequestOptions<TParams> & {
  schema?: ZodType<TData>;
};

// ─── Internal request helper ───────────────────────────────────────────────────

function parseResponseData<TData>(
  payload: unknown,
  schema?: ZodType<TData>,
  url?: string,
): TData {
  if (!schema) return payload as TData;
  return validateSchema(schema, payload, `Response from ${url ?? "endpoint"}`);
}

async function request<
  TData,
  TBody = unknown,
  TParams = Record<string, unknown>,
>(
  method: HttpMethod,
  url: string,
  body: TBody | undefined,
  options?: ApiRequestWithSchemaOptions<TData, TParams>,
): Promise<TData> {
  const { schema, ...requestOptions } = options ?? {};

  const response = await apiClient.request<unknown>({
    method,
    url,
    data: body,
    ...requestOptions,
  });

  return parseResponseData(response.data, schema, url);
}

// ─── Public helpers ────────────────────────────────────────────────────────────

export async function apiGet<TData, TParams = Record<string, unknown>>(
  url: string,
  options?: ApiRequestWithSchemaOptions<TData, TParams>,
): Promise<TData> {
  return request<TData, never, TParams>("GET", url, undefined, options);
}

export async function apiPost<
  TData,
  TBody = unknown,
  TParams = Record<string, unknown>,
>(
  url: string,
  body?: TBody,
  options?: ApiRequestWithSchemaOptions<TData, TParams>,
): Promise<TData> {
  return request<TData, TBody, TParams>("POST", url, body, options);
}

export async function apiPut<
  TData,
  TBody = unknown,
  TParams = Record<string, unknown>,
>(
  url: string,
  body?: TBody,
  options?: ApiRequestWithSchemaOptions<TData, TParams>,
): Promise<TData> {
  return request<TData, TBody, TParams>("PUT", url, body, options);
}

export async function apiPatch<
  TData,
  TBody = unknown,
  TParams = Record<string, unknown>,
>(
  url: string,
  body?: TBody,
  options?: ApiRequestWithSchemaOptions<TData, TParams>,
): Promise<TData> {
  return request<TData, TBody, TParams>("PATCH", url, body, options);
}

export async function apiDelete<TData, TParams = Record<string, unknown>>(
  url: string,
  options?: ApiRequestWithSchemaOptions<TData, TParams>,
): Promise<TData> {
  return request<TData, never, TParams>("DELETE", url, undefined, options);
}

/**
 * Strips the "[STATUS]" prefix (added by the server-side interceptor) and
 * returns the human-readable message. Safe to call on any error type.
 *
 * Examples:
 *   "[401] Token telah kadaluarsa" → "Token telah kadaluarsa"
 *   "[404] Unit tidak ditemukan"   → "Unit tidak ditemukan"
 *   "Something went wrong"         → "Something went wrong" (no prefix, unchanged)
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Strip [STATUS] prefix if present
    return error.message.replace(/^\[\d+\]\s*/, "");
  }

  if (typeof error === "string") return error;

  return "Terjadi kesalahan yang tidak diketahui.";
}

export async function isAxiosApiError(error: unknown): Promise<boolean> {
  return axios.isAxiosError(error);
}
