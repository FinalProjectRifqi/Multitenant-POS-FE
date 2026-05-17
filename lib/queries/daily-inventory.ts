"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handle-api-error";
import { formatApiError } from "@/lib/api/parsed-api-error";
import {
  getDailyPlans,
  getDailyRealizations,
  getDailyUsageReport,
  createDailyPlans,
  updateDailyPlanItem,
  createDailyRealizations,
  submitDailyRealization,
} from "@/lib/api/daily-inventory";
import { inventarisQueryKeys } from "@/lib/queries/inventaris-keys";
import type {
  CreateDailyPlansInput,
  UpdatePlanItemInput,
  CreateDailyRealizationsInput,
} from "@/lib/schemas/daily-inventory";

export const dailyInventoryQueryKeys = {
  all: () => ["daily-inventory"] as const,
  plans: (unitId: string, date: string) =>
    [...dailyInventoryQueryKeys.all(), "plans", unitId, date] as const,
  realizations: (unitId: string, date: string) =>
    [...dailyInventoryQueryKeys.all(), "realizations", unitId, date] as const,
  report: (unitId: string, date: string) =>
    [...dailyInventoryQueryKeys.all(), "report", unitId, date] as const,
};

export function useDailyPlansQuery(unitId: string, date: string) {
  return useQuery({
    queryKey: dailyInventoryQueryKeys.plans(unitId, date),
    queryFn: () => getDailyPlans(unitId, date),
    enabled: Boolean(unitId) && Boolean(date),
    meta: { errorTitle: "Gagal Memuat Rencana Inventaris Harian" },
  });
}

export function useDailyRealizationsQuery(unitId: string, date: string) {
  return useQuery({
    queryKey: dailyInventoryQueryKeys.realizations(unitId, date),
    queryFn: () => getDailyRealizations(unitId, date),
    enabled: Boolean(unitId) && Boolean(date),
    meta: { errorTitle: "Gagal Memuat Realisasi Inventaris Harian" },
  });
}

export function useDailyUsageReportQuery(unitId: string, date: string) {
  return useQuery({
    queryKey: dailyInventoryQueryKeys.report(unitId, date),
    queryFn: () => getDailyUsageReport(unitId, date),
    enabled: Boolean(unitId) && Boolean(date),
    meta: { errorTitle: "Gagal Memuat Laporan Penggunaan Harian" },
  });
}

export function useCreateDailyPlansMutation(unitId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: CreateDailyPlansInput) => {
      const result = await createDailyPlans(unitId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      toast.success("Rencana inventaris harian berhasil disimpan.", {
        description: "Perencanaan tidak mengurangi stok.",
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: dailyInventoryQueryKeys.plans(unitId, variables.date),
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
  return {
    createPlans: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useUpdateDailyPlanItemMutation(unitId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      planId,
      payload,
      date,
    }: {
      planId: string;
      payload: UpdatePlanItemInput;
      date: string;
    }) => {
      const result = await updateDailyPlanItem(unitId, planId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return { data: result.data, date };
    },
    onSuccess: ({ date }) => {
      toast.success("Rencana inventaris berhasil diperbarui.", {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: dailyInventoryQueryKeys.plans(unitId, date),
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
  return {
    updatePlanItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useCreateDailyRealizationsMutation(unitId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: CreateDailyRealizationsInput) => {
      const result = await createDailyRealizations(unitId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: (data, variables) => {
      const allSubmitted =
        data.length > 0 && data.every((r) => r.status === "SUBMITTED");
      const title =
        data.length === 0
          ? "Realisasi tanggal ini sudah tersimpan."
          : allSubmitted
            ? "Realisasi inventaris berhasil disubmit."
            : "Realisasi inventaris berhasil disimpan.";
      const description =
        data.length === 0
          ? "Tidak ada baris baru yang perlu dikirim ulang."
          : allSubmitted
            ? "Stok inventaris telah diperbarui."
            : "Submit realisasi untuk memperbarui stok.";

      toast.success(
        title,
        {
          description,
          position: "top-right",
          richColors: true,
          duration: 3000,
        },
      );
      queryClient.invalidateQueries({
        queryKey: dailyInventoryQueryKeys.realizations(unitId, variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: dailyInventoryQueryKeys.report(unitId, variables.date),
      });
      if (allSubmitted) {
        queryClient.invalidateQueries({
          queryKey: inventarisQueryKeys.lists(unitId),
        });
        queryClient.invalidateQueries({
          queryKey: inventarisQueryKeys.stats(unitId),
        });
      }
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
  return {
    createRealizations: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useSubmitDailyRealizationMutation(unitId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      realizationId,
      date,
    }: {
      realizationId: string;
      date: string;
    }) => {
      const result = await submitDailyRealization(unitId, realizationId);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return { data: result.data, date };
    },
    onSuccess: ({ date }) => {
      toast.success("Realisasi inventaris berhasil disubmit.", {
        description: "Stok inventaris telah diperbarui.",
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: dailyInventoryQueryKeys.realizations(unitId, date),
      });
      queryClient.invalidateQueries({
        queryKey: dailyInventoryQueryKeys.report(unitId, date),
      });
      queryClient.invalidateQueries({
        queryKey: inventarisQueryKeys.lists(unitId),
      });
      queryClient.invalidateQueries({
        queryKey: inventarisQueryKeys.stats(unitId),
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
  return {
    submitRealization: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
