import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { UnitPageContent } from "../../../../components/unit/unit-page-content";
import { getUnits } from "@/lib/api/units";
import { unitQueryKeys } from "@/lib/queries/unit-keys";

export default async function GroupUnitPage() {
  // Create a new QueryClient for this request (server-side)
  const queryClient = new QueryClient();

  // Prefetch the main query data
  // We only prefetch the default params (page: 1, limit: 10, showInactive: true)
  // If prefetch fails (e.g., 401), the error is captured in the cache
  // and will be displayed by the client component's error handling
  try {
    await queryClient.prefetchQuery({
      queryKey: [
        ...unitQueryKeys.lists(),
        { page: 1, limit: 10, showInactive: true },
      ],
      queryFn: () => getUnits({ page: 1, limit: 10, show_inactive: true }),
    });
  } catch (error) {
    // Silently catch prefetch errors
    // The client will receive the error state and handleApiError will process it
    console.error("Failed to prefetch units:", error);
  }

  // Dehydrate the query client state and pass to client
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <UnitPageContent />
    </HydrationBoundary>
  );
}
