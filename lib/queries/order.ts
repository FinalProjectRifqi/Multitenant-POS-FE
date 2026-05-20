"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handle-api-error";
import { getOrders, updateOrderStatus } from "@/lib/api/orders";
import { createCrudQueryKeys, upsertEntityByKey } from "@/lib/queries/crud";
import type {
  KdsStatus,
  OrderEntity,
  UpdateOrderStatusInput,
} from "@/lib/schemas/order";
import { KDS_STATUS_META } from "@/lib/kitchen-display/constants";

// ── Query keys ─────────────────────────────────────────────────────────────────

export const orderQueryKeys = createCrudQueryKeys("orders");

// Polling interval: 25 seconds (within the requested 20-30 s range)
const KDS_POLL_INTERVAL_MS = 15_000;

// ── Types ──────────────────────────────────────────────────────────────────────

type OrderListCache = OrderEntity[];

// ── Internal cache helpers ────────────────────────────────────────────────────

function useOrderListCache() {
  const queryClient = useQueryClient();

  const setListCache = (
    updater: (current: OrderListCache) => OrderListCache,
  ) => {
    queryClient.setQueryData<OrderEntity[]>(
      orderQueryKeys.lists(),
      (current = []) => updater(current),
    );
  };

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() });

  return { queryClient, setListCache, invalidateList };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetches all KDS orders and auto-refreshes every KDS_POLL_INTERVAL_MS.
 *
 * refetchIntervalInBackground = false → pauses polling when the tab is hidden,
 * avoiding unnecessary requests while the kitchen staff isn't looking at the
 * screen. Polling resumes immediately when the tab becomes active again.
 */
export function useOrdersQuery() {
  return useQuery({
    queryKey: orderQueryKeys.lists(),
    queryFn: getOrders,
    refetchInterval: KDS_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    // Prevent stale flash: keep showing cached data while revalidating
    staleTime: KDS_POLL_INTERVAL_MS / 2,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Updates the KDS status of a single order with optimistic UI.
 *
 * Optimistic update flow:
 *   1. Immediately patch the cached order (UI updates instantly)
 *   2. Fire the API/dummy call in background
 *   3. On success → overwrite cache with server response
 *   4. On error   → roll back to previous cache + show toast
 *   5. On settled → invalidate to trigger a fresh poll
 */
export function useUpdateOrderStatusMutation() {
  const { queryClient, setListCache, invalidateList } = useOrderListCache();

  const mutation = useMutation({
    mutationFn: (input: UpdateOrderStatusInput) => updateOrderStatus(input),

    onMutate: async (input) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey: orderQueryKeys.lists() });

      const previous =
        queryClient.getQueryData<OrderEntity[]>(orderQueryKeys.lists()) ?? [];

      // Optimistically update the status in the cache
      setListCache((current) =>
        current.map((order) =>
          order.order_id === input.order_id
            ? { ...order, kds_status: input.payload.kds_status }
            : order,
        ),
      );

      return { previous };
    },

    onSuccess: (updatedOrder) => {
      // Merge the confirmed server response into cache
      setListCache((current) =>
        upsertEntityByKey(current, updatedOrder, "order_id"),
      );

      const meta = KDS_STATUS_META[updatedOrder.kds_status as KdsStatus];
      toast.success(`Status pesanan diperbarui.`, {
        description: `${updatedOrder.order_number} → ${meta.label}`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },

    onError: (error, _input, context) => {
      // Roll back optimistic change
      if (context?.previous) {
        queryClient.setQueryData(orderQueryKeys.lists(), context.previous);
      }

      handleApiError(error);
    },

    onSettled: () => {
      // Always re-sync with server after mutation
      invalidateList();
    },
  });

  return {
    updateOrderStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    pendingOrderId: mutation.isPending
      ? mutation.variables?.order_id
      : undefined,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
