"use client";

import { useQuery } from "@tanstack/react-query";

import { getUomOptions } from "@/lib/api/uom";

export const uomQueryKeys = {
  all: ["uom"] as const,
  options: () => [...uomQueryKeys.all, "options"] as const,
};

export function useUomOptions() {
  return useQuery({
    queryKey: uomQueryKeys.options(),
    queryFn: getUomOptions,
    // UOM options are reference data — rarely change; no need to re-fetch
    staleTime: Infinity,
  });
}
