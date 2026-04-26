import { useQuery } from "@tanstack/react-query";
import { buildGetQueryOptions } from "@/lib/queries/base";
import {
  healthResponseSchema,
  type HealthResponse,
} from "@/lib/schemas/health";

export const healthQueryKey = ["health"] as const;

export function useHealthQuery() {
  return useQuery(
    buildGetQueryOptions<HealthResponse>({
      queryKey: healthQueryKey,
      url: "/health",
      schema: healthResponseSchema,
    }),
  );
}
