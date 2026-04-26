import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
} from "axios";
import type { ZodType } from "zod";
import { validateSchema } from "@/lib/api/validator";

const DEFAULT_TIMEOUT_IN_MS = 15_000;

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  timeout: DEFAULT_TIMEOUT_IN_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Accept", "application/json");
  config.headers = headers;

  return config;
});

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

export function apiGet<TData, TParams = Record<string, unknown>>(
  url: string,
  options?: ApiRequestWithSchemaOptions<TData, TParams>,
): Promise<TData> {
  return request<TData, never, TParams>("GET", url, undefined, options);
}

export function apiPost<
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

export function apiPut<
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

export function apiPatch<
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

export function apiDelete<TData, TParams = Record<string, unknown>>(
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

export function isAxiosApiError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}
