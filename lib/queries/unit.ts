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
import type { CreateUnitRequest, UnitEntity } from "@/lib/schemas/unit";

export const unitQueryKeys = createCrudQueryKeys("units");

type UnitListCache = UnitEntity[];

function useUnitListCache() {
  const queryClient = useQueryClient();

  const setListCache = (updater: (current: UnitListCache) => UnitListCache) => {
    queryClient.setQueryData<UnitEntity[]>(
      unitQueryKeys.lists(),
      (current = []) => updater(current),
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

export function useUnitsQuery() {
  return useQuery({
    queryKey: unitQueryKeys.lists(),
    queryFn: getUnits,
  });
}

export function useCreateUnitMutation() {
  const { setListCache, invalidateList } = useUnitListCache();

  const mutation = useMutation({
    mutationFn: (payload: CreateUnitRequest) => createUnit(payload),
    onSuccess: (createdUnit) => {
      setListCache((current) =>
        upsertEntityByKey(current, createdUnit, "unit_id"),
      );

      toast.success("Unit usaha berhasil ditambahkan.", {
        description: `${createdUnit.unit_name} siap digunakan.`,
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

      const previous =
        queryClient.getQueryData<UnitEntity[]>(unitQueryKeys.lists()) ?? [];

      setListCache((current) =>
        current.map((unit) =>
          unit.unit_id === input.unit_id
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
        upsertEntityByKey(current, updatedUnit, "unit_id"),
      );

      toast.success("Unit usaha berhasil diperbarui.", {
        description: `${updatedUnit.unit_name} telah diperbarui.`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(unitQueryKeys.lists(), context.previous);
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

      const previous =
        queryClient.getQueryData<UnitEntity[]>(unitQueryKeys.lists()) ?? [];
      const target = previous.find((item) => item.unit_id === input.unit_id);

      setListCache((current) =>
        removeEntityByKey(current, "unit_id", input.unit_id),
      );

      return {
        previous,
        deletedName: target?.unit_name ?? "Unit usaha",
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
        queryClient.setQueryData(unitQueryKeys.lists(), context.previous);
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
