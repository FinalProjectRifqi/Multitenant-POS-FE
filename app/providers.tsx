"use client";

import {
  environmentManager,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { handleApiError } from "@/lib/api/handle-api-error";
import { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const meta = query.meta as { errorTitle?: string } | undefined;
        handleApiError(error, { title: meta?.errorTitle });
      },
    }),
    defaultOptions: {
      queries: {
        // With SSR + prefetch pattern, we usually want to set staleTime
        // above 0 to avoid refetching prefetched data immediately on the client
        retry: 1,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (environmentManager.isServer()) {
    // Server: always make a new query client
    // Note: This is used by Server Components during the rendering phase.
    // With the prefetch pattern, Server Components call prefetchQuery which
    // doesn't execute queryFn on the "app" phase (client component initialization).
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: ProvidersProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
