"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import {
  createUnit,
  deleteUnit,
  getUnits,
  type UpdateUnitInput,
  updateUnit,
  type DeleteUnitInput,
} from "@/lib/api/units";
import {
  createCrudQueryKeys,
  removeEntityByKey,
  upsertEntityByKey,
} from "@/lib/queries/crud";
import type { CreateUnitRequest, UnitEntity } from "@/lib/types/unit";
import type { UnitsListResponse } from "@/lib/schemas/unit";

export const unitQueryKeys = createCrudQueryKeys("units");

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
      }
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

export function useUnitsQuery(page = 1, limit = 10, showInactive = true) {
  return useQuery({
    queryKey: [...unitQueryKeys.lists(), { page, limit, showInactive }],
    queryFn: () => getUnits({ page, limit, show_inactive: showInactive }),
  });
}
export function useCreateUnitMutation() {
  const { setListCache, invalidateList } = useUnitListCache();

  const mutation = useMutation({
    mutationFn: (payload: CreateUnitRequest) => createUnit(payload),
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
      toast.error(getErrorMessage(error), {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
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
    mutationFn: (input: UpdateUnitInput) => updateUnit(input),
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

      toast.error(getErrorMessage(error), {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
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
    mutationFn: (input: DeleteUnitInput) => deleteUnit(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: unitQueryKeys.lists() });

      const previous = queryClient.getQueriesData<UnitsListResponse>({
        queryKey: unitQueryKeys.lists(),
      });

      let target: UnitEntity | undefined;
      previous.forEach(([_, data]) => {
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

      toast.error(getErrorMessage(error), {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
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
