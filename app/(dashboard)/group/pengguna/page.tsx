import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { UserPageContent } from "@/components/user/user-page-content";
import { getUsers } from "@/lib/api/users";
import { userQueryKeys } from "@/lib/queries/user-keys";

export default async function GroupUserPage() {
  // Create a new QueryClient for this request (server-side)
  const queryClient = new QueryClient();

  // Prefetch the main query data
  // If prefetch fails (e.g., 401), the error is captured in the cache
  // and will be displayed by the client component's error handling
  try {
    await queryClient.prefetchQuery({
      queryKey: [
        ...userQueryKeys.lists(),
        {
          page: 1,
          limit: 10,
          sortBy: "last_login",
          sortType: "DESC",
          search: "",
        },
      ],
      queryFn: () =>
        getUsers({
          page: 1,
          limit: 10,
          sortBy: "last_login",
          sortType: "DESC",
          search: "",
        }),
    });
  } catch (error) {
    // Silently catch prefetch errors
    // The client will receive the error state and handleApiError will process it
    console.error("Failed to prefetch users:", error);
  }

  // Dehydrate the query client state and pass to client
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <UserPageContent />
    </HydrationBoundary>
  );
}
