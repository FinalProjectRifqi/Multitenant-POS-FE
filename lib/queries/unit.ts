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
  createUnit,
  deleteUnit,
  getUnits,
  updateUnit,
  type DeleteUnitInput,
  type UpdateUnitInput,
} from "@/lib/api/units";
import { removeEntityByKey, upsertEntityByKey } from "@/lib/queries/crud";
import { unitQueryKeys } from "@/lib/queries/unit-keys";
import type { UnitsListResponse } from "@/lib/schemas/unit";
import type { CreateUnitRequest, UnitEntity } from "@/lib/types/unit";

function useUnitListCache() {
  const queryClient = useQueryClient();

  const setListCache = (updater: (current: UnitEntity[]) => UnitEntity[]) => {
    queryClient.setQueriesData<UnitsListResponse>(
      { queryKey: unitQueryKeys.lists() },
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: updater(current.data || []),
        };
      },
    );
  };

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: unitQueryKeys.lists() });

  return {
    queryClient,
    setListCache,
    invalidateList,
  };
}

export function useUnitsQuery(
  page = 1,
  limit = 10,
  showInactive = true,
  enabled = true,
) {
  return useQuery({
    queryKey: [...unitQueryKeys.lists(), { page, limit, showInactive }],
    queryFn: () => getUnits({ page, limit, show_inactive: showInactive }),
    enabled,
    meta: {
      errorTitle: "Gagal Memuat Unit Usaha",
    },
  });
}

export function useCreateUnitMutation() {
  const { setListCache, invalidateList } = useUnitListCache();

  const mutation = useMutation({
    mutationFn: async (payload: CreateUnitRequest) => {
      const result = await createUnit(payload);

      if (!result.ok) {
        throw formatApiError(result.status, result.message);
      }

      return result.data;
    },
    onSuccess: (createdUnit) => {
      setListCache((current) =>
        upsertEntityByKey(current, createdUnit, "business_unit_id"),
      );

      toast.success("Unit usaha berhasil ditambahkan.", {
        description: `${createdUnit.business_unit_name} siap digunakan.`,
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
    },
  });

  return {
    createUnit: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useUpdateUnitMutation() {
  const { queryClient, setListCache, invalidateList } = useUnitListCache();

  const mutation = useMutation({
    mutationFn: async (input: UpdateUnitInput) => {
      const result = await updateUnit(input);

      if (!result.ok) {
        throw formatApiError(result.status, result.message);
      }

      return result.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: unitQueryKeys.lists() });

      const previous = queryClient.getQueriesData<UnitsListResponse>({
        queryKey: unitQueryKeys.lists(),
      });

      setListCache((current) =>
        current.map((unit) =>
          unit.business_unit_id === input.business_unit_id
            ? {
                ...unit,
                ...input.payload,
                updated_at: new Date().toISOString(),
              }
            : unit,
        ),
      );

      return { previous };
    },
    onSuccess: (updatedUnit) => {
      setListCache((current) =>
        upsertEntityByKey(current, updatedUnit, "business_unit_id"),
      );

      toast.success("Unit usaha berhasil diperbarui.", {
        description: `${updatedUnit.business_unit_name} telah diperbarui.`,
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
    },
  });

  return {
    updateUnit: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useDeleteUnitMutation() {
  const { queryClient, setListCache, invalidateList } = useUnitListCache();

  const mutation = useMutation({
    mutationFn: async (input: DeleteUnitInput) => {
      const result = await deleteUnit(input);

      if (!result.ok) {
        throw formatApiError(result.status, result.message);
      }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: unitQueryKeys.lists() });

      const previous = queryClient.getQueriesData<UnitsListResponse>({
        queryKey: unitQueryKeys.lists(),
      });

      let target: UnitEntity | undefined;
      previous.forEach(([, data]) => {
        if (!target && data?.data) {
          target = data.data.find(
            (item) => item.business_unit_id === input.business_unit_id,
          );
        }
      });

      setListCache((current) =>
        removeEntityByKey(current, "business_unit_id", input.business_unit_id),
      );

      return {
        previous,
        deletedName: target?.business_unit_name ?? "Unit usaha",
      };
    },
    onSuccess: (_result, _input, context) => {
      toast.success("Unit usaha berhasil dihapus.", {
        description: `${context?.deletedName ?? "Unit usaha"} telah dihapus.`,
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
    },
  });

  return {
    deleteUnit: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
