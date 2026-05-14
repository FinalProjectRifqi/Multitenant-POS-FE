import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { GroupInventarisPageContent } from "@/components/inventaris/group-inventaris-page-content";
import { getUnits } from "@/lib/api/units";
import { unitQueryKeys } from "@/lib/queries/unit-keys";

export default async function Page() {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: [
        ...unitQueryKeys.lists(),
        { page: 1, limit: 100, showInactive: false },
      ],
      queryFn: () => getUnits({ page: 1, limit: 100, show_inactive: false }),
    });
  } catch (error) {
    console.error("Failed to prefetch units for inventaris selector:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupInventarisPageContent />
    </HydrationBoundary>
  );
}
