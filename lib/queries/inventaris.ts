"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import {
  handleApiError,
  shouldHandleMutationErrorGlobally,
} from "@/lib/api/handle-api-error";
import { formatApiError } from "@/lib/api/parsed-api-error";
import {
  createInventarisItem,
  deleteInventarisItem,
  getInventarisItems,
  getInventarisStats,
  updateInventarisItem,
  type ListInventarisParams,
} from "@/lib/api/inventaris";
import { removeEntityByKey, upsertEntityByKey } from "@/lib/queries/crud";
import { inventarisQueryKeys } from "@/lib/queries/inventaris-keys";
import type {
  InventarisItem,
  InventarisListResponse,
} from "@/lib/schemas/inventaris";
import type { InventarisItemFormValues } from "@/lib/schemas/inventaris";
import { isUuid } from "@/lib/utils";

// ─── Cache helpers ────────────────────────────────────────────────────────────

function useInventarisListCache(businessId: string) {
  const queryClient = useQueryClient();

  const setListCache = (
    updater: (current: InventarisItem[]) => InventarisItem[],
  ) => {
    queryClient.setQueriesData<InventarisListResponse>(
      { queryKey: inventarisQueryKeys.lists(businessId) },
      (current) => {
        if (!current) return current;
        return { ...current, data: updater(current.data ?? []) };
      },
    );
  };

  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: inventarisQueryKeys.lists(businessId),
    });

  const invalidateStats = () =>
    queryClient.invalidateQueries({
      queryKey: inventarisQueryKeys.stats(businessId),
    });

  return { queryClient, setListCache, invalidateList, invalidateStats };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useInventarisItemsQuery(
  businessId: string,
  params?: ListInventarisParams,
) {
  return useQuery({
    queryKey: [...inventarisQueryKeys.lists(businessId), params],
    queryFn: () => getInventarisItems(businessId, params),
    enabled: isUuid(businessId),
    meta: { errorTitle: "Gagal Memuat Data Inventaris" },
  });
}

export function useInventarisStatsQuery(businessId: string) {
  return useQuery({
    queryKey: inventarisQueryKeys.stats(businessId),
    queryFn: () => getInventarisStats(businessId),
    enabled: isUuid(businessId),
    meta: { errorTitle: "Gagal Memuat Statistik Inventaris" },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export type CreateInventarisInput = InventarisItemFormValues;
export type UpdateInventarisInput = {
  inventoryItemId: string;
  payload: InventarisItemFormValues;
};
export type DeleteInventarisInput = { inventoryItemId: string };

export function useCreateInventarisMutation(businessId: string) {
  const { setListCache, invalidateList, invalidateStats } =
    useInventarisListCache(businessId);

  const mutation = useMutation({
    mutationFn: async (payload: InventarisItemFormValues) => {
      const result = await createInventarisItem(businessId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: (created) => {
      setListCache((current) =>
        upsertEntityByKey(current, created, "inventory_item_id"),
      );
      toast.success("Barang Inventaris Berhasil Ditambahkan", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) {
        handleApiError(error);
      }
    },
    onSettled: () => {
      invalidateList();
      invalidateStats();
    },
  });

  return {
    createInventaris: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useUpdateInventarisMutation(businessId: string) {
  const { queryClient, setListCache, invalidateList, invalidateStats } =
    useInventarisListCache(businessId);

  const mutation = useMutation({
    mutationFn: async (input: UpdateInventarisInput) => {
      const result = await updateInventarisItem(
        businessId,
        input.inventoryItemId,
        input.payload,
      );
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: inventarisQueryKeys.lists(businessId),
      });
      const previous = queryClient.getQueriesData<InventarisListResponse>({
        queryKey: inventarisQueryKeys.lists(businessId),
      });
      setListCache((current) =>
        current.map((item) =>
          item.inventory_item_id === input.inventoryItemId
            ? {
                ...item,
                ...input.payload,
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      return { previous };
    },
    onSuccess: (updated) => {
      setListCache((current) =>
        upsertEntityByKey(current, updated, "inventory_item_id"),
      );
      toast.success("Barang Inventaris Berhasil Diperbarui", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (shouldHandleMutationErrorGlobally(error)) {
        handleApiError(error);
      }
    },
    onSettled: () => {
      invalidateList();
      invalidateStats();
    },
  });

  return {
    updateInventaris: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useDeleteInventarisMutation(businessId: string) {
  const { queryClient, setListCache, invalidateList, invalidateStats } =
    useInventarisListCache(businessId);

  const mutation = useMutation({
    mutationFn: async (input: DeleteInventarisInput) => {
      const result = await deleteInventarisItem(
        businessId,
        input.inventoryItemId,
      );
      if (!result.ok) throw formatApiError(result.status, result.message);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: inventarisQueryKeys.lists(businessId),
      });
      const previous = queryClient.getQueriesData<InventarisListResponse>({
        queryKey: inventarisQueryKeys.lists(businessId),
      });
      let deletedName = "Barang";
      previous.forEach(([, data]) => {
        if (data?.data) {
          const found = data.data.find(
            (item) => item.inventory_item_id === input.inventoryItemId,
          );
          if (found) deletedName = found.inventory_item_name;
        }
      });
      setListCache((current) =>
        removeEntityByKey(current, "inventory_item_id", input.inventoryItemId),
      );
      return { previous, deletedName };
    },
    onSuccess: (_result, _input, context) => {
      toast.success("Barang Inventaris Berhasil Dihapus", {
        description: `${context?.deletedName ?? "Barang"} telah dihapus.`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (shouldHandleMutationErrorGlobally(error)) {
        handleApiError(error);
      }
    },
    onSettled: () => {
      invalidateList();
      invalidateStats();
    },
  });

  return {
    deleteInventaris: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
