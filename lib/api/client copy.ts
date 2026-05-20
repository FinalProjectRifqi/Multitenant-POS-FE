import axios, { AxiosHeaders, type AxiosRequestConfig } from "axios";
import type { ZodType } from "zod";
import { validateSchema } from "@/lib/api/validator";
// import { auth } from "@/lib/nextauth/auth";
import { getSession } from "next-auth/react";
// import { toast } from "sonner";
// import { redirect } from "next/navigation";

const DEFAULT_TIMEOUT_IN_MS = 15_000;

const BASE_URL = (process.env.API_BASE_URL ?? "").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_IN_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Accept", "application/json");

  // Attach the backend access_token as Bearer token for all API calls.
  // getSession() reads the NextAuth session (from the httpOnly cookie server-side,
  // or from the client session cache). Safe to call on every request — it's cached.
  //
  // NOTE: This interceptor only runs in the browser (client-side React Query hooks).
  //       Server-side callers (Server Components / API Routes) must attach the token
  //       manually using auth() from lib/nextauth/auth.ts.
  if (typeof window !== "undefined") {
    const session = await getSession();
    if (session?.user?.access_token) {
      headers.set("Authorization", `Bearer ${session.user.access_token}`);
    }
  }

  config.headers = headers;
  return config;
});

// TODO: Add response interceptor to handle global API errors (e.g. 401 Unauthorized, 403 Forbidden, 500 Internal Server Error) and show user-friendly error messages or trigger specific actions (e.g. logout on 401).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging purposes
    console.error("API request error:", error);
    // TODO: Implement global error handling logic here (show toast notification and redirect to login on 401)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Handle unauthorized error (e.g. show toast and redirect to login)
        // toast.error("Sesi Anda telah berakhir. Silakan login kembali.", {
        //   position: "top-right",
        //   richColors: true,
        //   duration: 3000,
        // });
        // redirect("/login");
      }
    }

    return Promise.reject(error);
  },
);

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

function parseResponseData<TData>(
  payload: unknown,
  schema?: ZodType<TData>,
  url?: string,
): TData {
  if (!schema) {
    return payload as TData;
  }

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

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responsePayload = error.response?.data;

    if (typeof responsePayload === "string" && responsePayload.trim()) {
      return responsePayload;
    }

    if (
      responsePayload &&
      typeof responsePayload === "object" &&
      "message" in responsePayload &&
      typeof responsePayload.message === "string"
    ) {
      return responsePayload.message;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

export async function isAxiosApiError(error: unknown): Promise<boolean> {
  return axios.isAxiosError(error);
}
