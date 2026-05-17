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

// ─── Cache helpers ─────────────────────────────────────────────────────────────

function useMenuListCache() {
  const queryClient = useQueryClient();

  const setListCache = (updater: (current: MenuEntity[]) => MenuEntity[]) => {
    queryClient.setQueriesData<MenusListResponse>(
      { queryKey: menuQueryKeys.lists() },
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: updater(current.data ?? []),
        };
      },
    );
  };

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: menuQueryKeys.lists() });

  return { queryClient, setListCache, invalidateList };
}

function getMenuEntityPatchFromPayload(
  payload: UpdateMenuInput["payload"],
): Partial<MenuEntity> {
  const patch: Partial<MenuEntity> = {};

  if (payload.menu_name !== undefined) patch.menu_name = payload.menu_name;
  if (payload.menu_category_id !== undefined) {
    patch.menu_category_id = payload.menu_category_id;
  }
  if (payload.item_price !== undefined) patch.menu_price = payload.item_price;
  if (payload.is_available !== undefined) {
    patch.is_available = payload.is_available;
  }

  return patch;
}

function applyMenuUpdateToList(
  current: MenuEntity[],
  input: UpdateMenuInput,
  updatedMenu?: MenuEntity,
): MenuEntity[] {
  const payloadPatch = getMenuEntityPatchFromPayload(input.payload);

  return current.map((item) =>
    item.menu_id === input.menu_id
      ? { ...item, ...updatedMenu, ...payloadPatch }
      : item,
  );
}

function getMenuUpdateToastDescription(
  updatedMenu: MenuEntity,
  input: UpdateMenuInput,
): string {
  const availability = getMenuEntityPatchFromPayload(input.payload).is_available;

  if (typeof availability === "boolean") {
    return `${updatedMenu.menu_name} sekarang ${
      availability ? "aktif" : "nonaktif"
    }.`;
  }

  return `${updatedMenu.menu_name} telah diperbarui.`;
}

// ─── Query ─────────────────────────────────────────────────────────────────────

export function useMenusQuery(businessId: string, params?: GetMenusParams) {
  return useQuery({
    queryKey: [...menuQueryKeys.lists(), { businessId, ...params }],
    queryFn: () => getMenus(businessId, params),
    enabled: Boolean(businessId),
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
      setListCache((current) =>
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
      invalidateList();
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
  const { queryClient, setListCache } = useMenuListCache();

  const mutation = useMutation({
    mutationFn: async (input: UpdateMenuInput) => {
      const result = await updateMenu(input);
      if (!result.ok) throw formatApiError(result.status, result.message);
      return result.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: menuQueryKeys.lists() });

      const previous = queryClient.getQueriesData<MenusListResponse>({
        queryKey: menuQueryKeys.lists(),
      });

      setListCache((current) => applyMenuUpdateToList(current, input));

      return { previous };
    },
    onSuccess: (updatedMenu, input) => {
      setListCache((current) =>
        applyMenuUpdateToList(current, input, updatedMenu),
      );
      toast.success("Menu berhasil diperbarui.", {
        description: getMenuUpdateToastDescription(updatedMenu, input),
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
      await queryClient.cancelQueries({ queryKey: menuQueryKeys.lists() });

      const previous = queryClient.getQueriesData<MenusListResponse>({
        queryKey: menuQueryKeys.lists(),
      });

      let target: MenuEntity | undefined;
      previous.forEach(([, data]) => {
        if (!target && data?.data) {
          target = data.data.find((item) => item.menu_id === input.menu_id);
        }
      });

      setListCache((current) =>
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
    onSettled: () => {
      invalidateList();
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
