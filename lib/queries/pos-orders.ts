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
  cancelPayment,
  cancelPosOrder,
  createCashlessPayment,
  createCashPayment,
  createPosOrder,
  getPaymentDetail,
  getPosOrderDetail,
  getPosOrders,
  simulateMidtransPaymentSuccess,
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

export const paymentQueryKeys = {
  detail: (unitId: string, orderId: string, paymentId: string) =>
    ["payment-detail", unitId, orderId, paymentId] as const,
};

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
  pollingInterval = 15_000,
) {
  const normalizedParams = params
    ? {
        ...params,
        search: params.search?.trim() || undefined,
      }
    : undefined;

  return useQuery({
    queryKey: posOrderQueryKeys.list(unitId, normalizedParams),
    queryFn: () => getPosOrders(unitId, normalizedParams),
    enabled: Boolean(unitId),
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true,
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
    refetchOnWindowFocus: true,
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

// ─── Mutation: cancel order status (KDS) ────────────────────────────────────

export function useCancelOrderStatusMutation(unitId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await cancelOrderStatus(unitId, orderId);
      if (!result.ok) throw formatApiError(result.status, result.message);
    },
    onSuccess: () => {
      toast.success("Status pesanan berhasil dibatalkan.", {
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
    cancelOrderStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

// ─── Query: payment detail polling ───────────────────────────────────────────

export function usePaymentDetailPollingQuery(
  unitId: string,
  orderId: string,
  paymentId: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: paymentQueryKeys.detail(unitId, orderId, paymentId ?? ""),
    queryFn: () => {
      if (!paymentId) {
        throw new Error("Payment ID is required to fetch payment detail");
      }
      return getPaymentDetail(unitId, orderId, paymentId);
    },
    enabled: enabled && Boolean(paymentId),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: 2,
    meta: { errorTitle: "Gagal memeriksa status pembayaran" },
  });
}

// ─── Mutation: cancel cashless payment ───────────────────────────────────────

export function useCancelPaymentMutation(unitId: string, orderId: string) {
  const mutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const result = await cancelPayment(unitId, orderId, paymentId);
      if (!result.ok) throw formatApiError(result.status, result.message);
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
  });

  return {
    cancelPayment: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useSimulateMidtransPaymentMutation(
  unitId: string,
  orderId: string,
  paymentId: string,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await simulateMidtransPaymentSuccess(
        unitId,
        orderId,
        paymentId,
      );
      if (!result.ok) throw formatApiError(result.status, result.message);
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: posOrderQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: posOrderQueryKeys.detail(unitId, orderId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.detail(unitId, orderId, paymentId),
      });
    },
  });

  return {
    simulateSuccess: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

// ─── Mutation: transition order status (KDS) ─────────────────────────────────

export function useTransitionOrderStatusMutation(
  unitId: string,
  orderId: string,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (orderStatusId: string) => {
      const result = await transitionOrderStatus(
        unitId,
        orderId,
        orderStatusId,
      );
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Status pesanan berhasil diperbarui.", {
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
    transitionStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
