"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import {
  handleApiError,
  shouldHandleMutationErrorGlobally,
} from "@/lib/api/handle-api-error";
import { formatApiError } from "@/lib/api/parsed-api-error";
import {
  createMenu,
  deleteMenu,
  getMenus,
  updateMenu,
  type DeleteMenuInput,
  type GetMenusParams,
  type UpdateMenuInput,
} from "@/lib/api/menu";
import { removeEntityByKey, upsertEntityByKey } from "@/lib/queries/crud";
import { menuQueryKeys } from "@/lib/queries/menu-keys";
import type {
  CreateMenuRequest,
  MenuEntity,
  MenusListResponse,
} from "@/lib/schemas/menu";
import { isUuid } from "@/lib/utils";

// ─── Cache helpers ─────────────────────────────────────────────────────────────

function isMenuListQueryForBusiness(query: Query, businessId: string): boolean {
  const [resource, scope, params] = query.queryKey;

  if (resource !== menuQueryKeys.all[0] || scope !== "list") {
    return false;
  }

  return (
    params != null &&
    typeof params === "object" &&
    "businessId" in params &&
    (params as { businessId?: unknown }).businessId === businessId
  );
}

function useMenuListCache() {
  const queryClient = useQueryClient();

  const setListCache = (
    businessId: string,
    updater: (current: MenuEntity[]) => MenuEntity[],
  ) => {
    queryClient.setQueriesData<MenusListResponse>(
      {
        queryKey: menuQueryKeys.lists(),
        predicate: (query) => isMenuListQueryForBusiness(query, businessId),
      },
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: updater(current.data ?? []),
        };
      },
    );
  };

  const invalidateList = (businessId: string) =>
    queryClient.invalidateQueries({
      queryKey: menuQueryKeys.lists(),
      predicate: (query) => isMenuListQueryForBusiness(query, businessId),
    });

  return { queryClient, setListCache, invalidateList };
}

// ─── Query ─────────────────────────────────────────────────────────────────────

export function useMenusQuery(businessId: string, params?: GetMenusParams) {
  const normalizedParams = params
    ? {
        ...params,
        search: params.search?.trim() || undefined,
      }
    : undefined;

  return useQuery({
    queryKey: [...menuQueryKeys.lists(), { businessId, ...normalizedParams }],
    queryFn: () => getMenus(businessId, normalizedParams),
    enabled: isUuid(businessId),
    meta: {
      errorTitle: "Gagal Memuat Menu",
    },
  });
}

// ─── Create ────────────────────────────────────────────────────────────────────

export function useCreateMenuMutation(businessId: string) {
  const { setListCache, invalidateList } = useMenuListCache();

  const mutation = useMutation({
    mutationFn: async (payload: CreateMenuRequest) => {
      const result = await createMenu(businessId, payload);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onSuccess: (createdMenu) => {
      setListCache(businessId, (current) =>
        upsertEntityByKey(current, createdMenu, "menu_id"),
      );
      toast.success("Menu berhasil ditambahkan.", {
        description: `${createdMenu.menu_name} siap ditampilkan.`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: () => {
      invalidateList(businessId);
    },
  });

  return {
    createMenu: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

// ─── Update ────────────────────────────────────────────────────────────────────

export function useUpdateMenuMutation() {
  const { queryClient, setListCache, invalidateList } = useMenuListCache();

  const mutation = useMutation({
    mutationFn: async (input: UpdateMenuInput) => {
      const result = await updateMenu(input);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: menuQueryKeys.lists(),
        predicate: (query) =>
          isMenuListQueryForBusiness(query, input.businessId),
      });

      const previous = queryClient.getQueriesData<MenusListResponse>({
        queryKey: menuQueryKeys.lists(),
        predicate: (query) =>
          isMenuListQueryForBusiness(query, input.businessId),
      });

      setListCache(input.businessId, (current) =>
        current.map((item) =>
          item.menu_id === input.menu_id
            ? { ...item, ...input.payload }
            : item,
        ),
      );

      return { previous };
    },
    onSuccess: (updatedMenu, input) => {
      setListCache(input.businessId, (current) =>
        upsertEntityByKey(current, updatedMenu, "menu_id"),
      );
      toast.success("Menu berhasil diperbarui.", {
        description: `${updatedMenu.menu_name} telah diperbarui.`,
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
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: (_data, _error, input) => {
      invalidateList(input.businessId);
    },
  });

  return {
    updateMenu: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteMenuMutation() {
  const { queryClient, setListCache, invalidateList } = useMenuListCache();

  const mutation = useMutation({
    mutationFn: async (input: DeleteMenuInput) => {
      const result = await deleteMenu(input);
      if (!result.ok) throw formatApiError(result.status, result.message);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: menuQueryKeys.lists(),
        predicate: (query) =>
          isMenuListQueryForBusiness(query, input.businessId),
      });

      const previous = queryClient.getQueriesData<MenusListResponse>({
        queryKey: menuQueryKeys.lists(),
        predicate: (query) =>
          isMenuListQueryForBusiness(query, input.businessId),
      });

      let target: MenuEntity | undefined;
      previous.forEach(([, data]) => {
        if (!target && data?.data) {
          target = data.data.find((item) => item.menu_id === input.menu_id);
        }
      });

      setListCache(input.businessId, (current) =>
        removeEntityByKey(current, "menu_id", input.menu_id),
      );

      return {
        previous,
        deletedName: target?.menu_name ?? "Menu",
      };
    },
    onSuccess: (_result, _input, context) => {
      toast.success("Menu berhasil dihapus.", {
        description: `${context?.deletedName ?? "Menu"} telah dihapus.`,
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
      if (shouldHandleMutationErrorGlobally(error)) handleApiError(error);
    },
    onSettled: (_data, _error, input) => {
      invalidateList(input.businessId);
    },
  });

  return {
    deleteMenu: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export type { MenuEntity, MenusListResponse };
