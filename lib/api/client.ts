import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from "axios";
import { z } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (config.data && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  config.headers = headers;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const fallbackMessage = "Something went wrong while calling the API.";
    const message =
      error.response?.data?.message ?? error.message ?? fallbackMessage;

    return Promise.reject(new ApiError(message, error.response?.status));
  },
);

export async function requestWithSchema<TSchema extends z.ZodTypeAny>(
  config: AxiosRequestConfig,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const response = await api.request(config);
  const parsed = schema.safeParse(response.data);

  if (!parsed.success) {
    throw new ApiError(`Response validation failed: ${parsed.error.message}`);
  }

  return parsed.data;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
