import { useQuery } from "@tanstack/react-query";
import { getInventarisItems } from "@/lib/api/inventaris";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const inventarisQueryKeys = {
  all: ["inventaris"] as const,
  lists: () => [...inventarisQueryKeys.all, "list"] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useInventarisItemsQuery() {
  return useQuery({
    queryKey: inventarisQueryKeys.lists(),
    queryFn: getInventarisItems,
  });
}
