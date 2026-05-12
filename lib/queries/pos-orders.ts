"use client";

// lib/queries/pos-orders.ts — React Query hooks for POS order management.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import {
  handleApiError,
  shouldHandleMutationErrorGlobally,
} from "@/lib/api/handle-api-error";
import { formatApiError } from "@/lib/api/parsed-api-error";
import {
  cancelOrderStatus,
  cancelPosOrder,
  createCashlessPayment,
  createCashPayment,
  createPosOrder,
  getPosOrderDetail,
  getPosOrders,
  transitionOrderStatus,
  updatePosOrder,
} from "@/lib/api/pos-orders";
import type {
  CreateOrderPayload,
  GetOrdersParams,
  PaymentPayload,
  UpdateOrderPayload,
} from "@/lib/orders/types";

// ─── Query key factory ────────────────────────────────────────────────────────

export const posOrderQueryKeys = {
  all: () => ["pos-orders"] as const,
  lists: () => [...posOrderQueryKeys.all(), "list"] as const,
  list: (unitId: string, params?: GetOrdersParams) =>
    [...posOrderQueryKeys.lists(), { unitId, ...params }] as const,
  details: () => [...posOrderQueryKeys.all(), "detail"] as const,
  detail: (unitId: string, orderId: string) =>
    [...posOrderQueryKeys.details(), unitId, orderId] as const,
};

// ─── Query: order list ─────────────────────────────────────────────────────────

export function usePosOrdersQuery(
  unitId: string,
  params?: GetOrdersParams,
  pollingInterval = 30_000,
) {
  return useQuery({
    queryKey: posOrderQueryKeys.list(unitId, params),
    queryFn: () => getPosOrders(unitId, params),
    enabled: Boolean(unitId),
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
    staleTime: pollingInterval / 2,
    meta: { errorTitle: "Gagal Memuat Pesanan" },
  });
}

// ─── Query: order detail ──────────────────────────────────────────────────────

export function usePosOrderDetailQuery(unitId: string, orderId: string) {
  return useQuery({
    queryKey: posOrderQueryKeys.detail(unitId, orderId),
    queryFn: () => getPosOrderDetail(unitId, orderId),
    enabled: Boolean(unitId) && Boolean(orderId),
    meta: { errorTitle: "Gagal Memuat Detail Pesanan" },
  });
}

// ─── Mutation: create order ───────────────────────────────────────────────────

export function useCreatePosOrderMutation(unitId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const result = await createPosOrder(unitId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: (createdOrder) => {
      toast.success("Pesanan berhasil dibuat.", {
        description: `Pesanan ${createdOrder.order_number} telah ditambahkan.`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

// ─── Mutation: update order ───────────────────────────────────────────────────

export function useUpdatePosOrderMutation(unitId: string, orderId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: UpdateOrderPayload) => {
      const result = await updatePosOrder(unitId, orderId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: (updatedOrder) => {
      toast.success("Pesanan berhasil diperbarui.", {
        description: `Pesanan ${updatedOrder.order_number} telah diperbarui.`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: posOrderQueryKeys.detail(unitId, orderId),
      });
    },
  });

  return {
    updateOrder: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

// ─── Mutation: cancel order ───────────────────────────────────────────────────

export function useCancelPosOrderMutation(unitId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await cancelPosOrder(unitId, orderId);
      if (!result.ok) throw formatApiError(result.status, result.message);
    },
    onSuccess: () => {
      toast.success("Pesanan berhasil dibatalkan.", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
    },
  });

  return {
    cancelOrder: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useCreateCashPaymentMutation(unitId: string, orderId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: PaymentPayload) => {
      const result = await createCashPayment(unitId, orderId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Pembayaran tunai berhasil diproses.", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: posOrderQueryKeys.detail(unitId, orderId),
      });
    },
  });

  return {
    createCashPayment: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useCreateCashlessPaymentMutation(
  unitId: string,
  orderId: string,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: PaymentPayload) => {
      const result = await createCashlessPayment(unitId, orderId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Payment cashless berhasil dibuat.", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: posOrderQueryKeys.detail(unitId, orderId),
      });
    },
  });

  return {
    createCashlessPayment: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useTransitionOrderStatusMutation(
  unitId: string,
  orderId: string,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (nextStatusId: string) => {
      const result = await transitionOrderStatus(unitId, orderId, nextStatusId);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Status order berhasil diperbarui.", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      handleApiError(error, { title: "Gagal memperbarui status order" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: posOrderQueryKeys.detail(unitId, orderId),
      });
    },
  });

  return {
    transitionStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useCancelOrderStatusMutation(unitId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await cancelOrderStatus(unitId, orderId);
      if (!result.ok) throw formatApiError(result.status, result.message);
    },
    onSuccess: () => {
      toast.success("Order berhasil dibatalkan.", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      handleApiError(error, { title: "Gagal membatalkan order" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
    },
  });

  return {
    cancelOrderStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
