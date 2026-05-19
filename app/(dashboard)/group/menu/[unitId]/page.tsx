import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { MenuPageContent } from "@/components/menu/menu-page-content";
import { getMenus } from "@/lib/api/menu";
import { menuQueryKeys } from "@/lib/queries/menu-keys";
import { isUuid } from "@/lib/utils";

type Props = {
  params: Promise<{ unitId: string }>;
};

export default async function GroupMenuUnitPage({ params }: Props) {
  const { unitId } = await params;

  // Create a new QueryClient for this request (server-side)
  const queryClient = new QueryClient();

  // Prefetch the menu list so it's immediately available on the client.
  // If prefetch fails (e.g., 401), the error is captured in the cache
  // and will be displayed by the client component's error handling.
  if (isUuid(unitId)) {
    try {
      await queryClient.prefetchQuery({
        queryKey: [
          ...menuQueryKeys.lists(),
          { businessId: unitId, page: 1, limit: 10 },
        ],
        queryFn: () => getMenus(unitId, { page: 1, limit: 10 }),
      });
    } catch (error) {
      console.error("Failed to prefetch menus:", error);
    }
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <MenuPageContent unitId={unitId} />
    </HydrationBoundary>
  );
}
