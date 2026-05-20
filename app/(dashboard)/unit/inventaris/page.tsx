import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { UnitInventarisPageContent } from "@/components/inventaris/unit-inventaris-page-content";
import { getInventarisItems, getInventarisStats } from "@/lib/api/inventaris";
import { auth } from "@/lib/nextauth/auth";
import { inventarisQueryKeys } from "@/lib/queries/inventaris-keys";
import { isUuid } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  const unitId = session?.user?.unit_id ?? "";

  const queryClient = new QueryClient();

  if (isUuid(unitId)) {
    try {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: [
            ...inventarisQueryKeys.lists(unitId),
            { page: 1, limit: 10 },
          ],
          queryFn: () => getInventarisItems(unitId, { page: 1, limit: 10 }),
        }),
        queryClient.prefetchQuery({
          queryKey: inventarisQueryKeys.stats(unitId),
          queryFn: () => getInventarisStats(unitId),
        }),
      ]);
    } catch (error) {
      console.error("Failed to prefetch inventaris:", error);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnitInventarisPageContent />
    </HydrationBoundary>
  );
}
