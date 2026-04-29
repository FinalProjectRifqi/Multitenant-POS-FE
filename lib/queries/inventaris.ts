"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import {
  createInventarisItem,
  deleteInventarisItem,
  getInventarisItems,
  updateInventarisItem,
  type CreateInventarisInput,
  type DeleteInventarisInput,
  type UpdateInventarisInput,
} from "@/lib/api/inventaris";
import { removeEntityByKey, upsertEntityByKey } from "@/lib/queries/crud";
import type { InventarisItem } from "@/lib/schemas/inventaris";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const inventarisQueryKeys = {
  all: ["inventaris"] as const,
  lists: () => [...inventarisQueryKeys.all, "list"] as const,
};

// ─── Cache helpers ────────────────────────────────────────────────────────────

function useInventarisListCache() {
  const queryClient = useQueryClient();

  const setListCache = (
    updater: (current: InventarisItem[]) => InventarisItem[],
  ) => {
    queryClient.setQueryData<InventarisItem[]>(
      inventarisQueryKeys.lists(),
      (current = []) => updater(current),
    );
  };

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: inventarisQueryKeys.lists() });

  return { queryClient, setListCache, invalidateList };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useInventarisItemsQuery() {
  return useQuery({
    queryKey: inventarisQueryKeys.lists(),
    queryFn: getInventarisItems,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateInventarisMutation() {
  const { setListCache, invalidateList } = useInventarisListCache();

  const mutation = useMutation({
    mutationFn: (input: CreateInventarisInput) => createInventarisItem(input),
    onSuccess: (created) => {
      setListCache((current) =>
        upsertEntityByKey(current, created, "inventaris_id"),
      );
      toast.success("Barang Inventaris Berhasil Ditambahkan", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error("Barang Inventaris Gagal Ditambahkan", {
        description: getErrorMessage(error),
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onSettled: () => invalidateList(),
  });

  return {
    createInventaris: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useUpdateInventarisMutation() {
  const { queryClient, setListCache, invalidateList } =
    useInventarisListCache();

  const mutation = useMutation({
    mutationFn: (input: UpdateInventarisInput) => updateInventarisItem(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: inventarisQueryKeys.lists(),
      });
      const previous =
        queryClient.getQueryData<InventarisItem[]>(
          inventarisQueryKeys.lists(),
        ) ?? [];
      setListCache((current) =>
        current.map((item) =>
          item.inventaris_id === input.inventaris_id
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
        upsertEntityByKey(current, updated, "inventaris_id"),
      );
      toast.success("Barang Inventaris Berhasil Diperbarui", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(inventarisQueryKeys.lists(), context.previous);
      }
      toast.error("Barang Inventaris Gagal Diperbarui", {
        description: getErrorMessage(error),
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onSettled: () => invalidateList(),
  });

  return {
    updateInventaris: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useDeleteInventarisMutation() {
  const { queryClient, setListCache, invalidateList } =
    useInventarisListCache();

  const mutation = useMutation({
    mutationFn: (input: DeleteInventarisInput) => deleteInventarisItem(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: inventarisQueryKeys.lists(),
      });
      const previous =
        queryClient.getQueryData<InventarisItem[]>(
          inventarisQueryKeys.lists(),
        ) ?? [];
      const target = previous.find(
        (item) => item.inventaris_id === input.inventaris_id,
      );
      setListCache((current) =>
        removeEntityByKey(current, "inventaris_id", input.inventaris_id),
      );
      return { previous, deletedName: target?.item_name ?? "Barang" };
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
        queryClient.setQueryData(inventarisQueryKeys.lists(), context.previous);
      }
      toast.error("Barang Inventaris Gagal Dihapus", {
        description: getErrorMessage(error),
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onSettled: () => invalidateList(),
  });

  return {
    deleteInventaris: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
