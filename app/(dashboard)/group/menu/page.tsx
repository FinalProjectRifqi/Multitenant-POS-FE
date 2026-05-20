import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { MenuSelectorContent } from "@/components/menu/menu-selector-content";
import { getUnits } from "@/lib/api/units";
import { unitQueryKeys } from "@/lib/queries/unit-keys";

export default async function GroupMenuPage() {
  // Create a new QueryClient for this request (server-side)
  const queryClient = new QueryClient();

  // Prefetch units so the unit-selector grid renders immediately.
  // If prefetch fails (e.g., 401), the error is captured in the cache
  // and will be displayed by the client component's error handling.
  try {
    await queryClient.prefetchQuery({
      queryKey: [
        ...unitQueryKeys.lists(),
        { page: 1, limit: 100, showInactive: false },
      ],
      queryFn: () => getUnits({ page: 1, limit: 100, show_inactive: false }),
    });
  } catch (error) {
    console.error("Failed to prefetch units for menu selector:", error);
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <MenuSelectorContent />
    </HydrationBoundary>
  );
}
