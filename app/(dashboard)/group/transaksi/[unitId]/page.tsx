import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { TransactionHistoryPageContent } from "@/components/transactions/transaction-history-page-content";
import { getTransactionHistory } from "@/lib/api/pos-orders";
import { getUnits } from "@/lib/api/units";
import { transactionHistoryQueryKeys } from "@/lib/queries/transaction-history";
import { unitQueryKeys } from "@/lib/queries/unit-keys";

type PageProps = {
  params: Promise<{ unitId: string }>;
};

export const dynamic = "force-dynamic";

export default async function GroupTransactionHistoryUnitPage({
  params,
}: PageProps) {
  const { unitId } = await params;
  const queryClient = new QueryClient();

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: transactionHistoryQueryKeys.list(unitId, {
          page: 1,
          limit: 10,
          sortBy: "ordered_at",
          sortType: "DESC",
        }),
        queryFn: () =>
          getTransactionHistory(unitId, {
            page: 1,
            limit: 10,
            sortBy: "ordered_at",
            sortType: "DESC",
          }),
      }),
      queryClient.prefetchQuery({
        queryKey: [
          ...unitQueryKeys.lists(),
          { page: 1, limit: 100, showInactive: false },
        ],
        queryFn: () => getUnits({ page: 1, limit: 100, show_inactive: false }),
      }),
    ]);
  } catch (error) {
    console.error("Failed to prefetch transaction history:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionHistoryPageContent
        unitId={unitId}
        showBackToUnitSelector
      />
    </HydrationBoundary>
  );
}
