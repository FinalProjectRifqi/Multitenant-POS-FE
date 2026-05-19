import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { GroupInventarisUnitPageContent } from "@/components/inventaris/group-inventaris-unit-page-content";
import { getInventarisItems, getInventarisStats } from "@/lib/api/inventaris";
import { inventarisQueryKeys } from "@/lib/queries/inventaris-keys";
import { isUuid } from "@/lib/utils";

type PageProps = {
  params: Promise<{ unitId: string }>;
};

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps) {
  const { unitId } = await params;

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
      console.error("Failed to prefetch group inventaris:", error);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupInventarisUnitPageContent unitId={unitId} />
    </HydrationBoundary>
  );
}
