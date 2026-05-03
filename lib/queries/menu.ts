"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handle-api-error";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuCategories,
  getMenuItems,
  type DeleteMenuItemInput,
  type UpdateMenuItemInput,
  updateMenuItem,
} from "@/lib/api/menu";
import {
  createCrudQueryKeys,
  removeEntityByKey,
  upsertEntityByKey,
} from "@/lib/queries/crud";
import type {
  CreateMenuItemRequest,
  MenuCategoryEntity,
  MenuItemEntity,
} from "@/lib/schemas/menu";

export const menuItemQueryKeys = createCrudQueryKeys("menu-items");
export const menuCategoryQueryKeys = createCrudQueryKeys("menu-categories");

type MenuItemListCache = MenuItemEntity[];

function useMenuItemListCache() {
  const queryClient = useQueryClient();

  const setListCache = (
    updater: (current: MenuItemListCache) => MenuItemListCache,
  ) => {
    queryClient.setQueryData<MenuItemEntity[]>(
      menuItemQueryKeys.lists(),
      (current = []) => updater(current),
    );
  };

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: menuItemQueryKeys.lists() });

  return {
    queryClient,
    setListCache,
    invalidateList,
  };
}

export function useMenuCategoriesQuery() {
  return useQuery({
    queryKey: menuCategoryQueryKeys.lists(),
    queryFn: getMenuCategories,
  });
}

export function useMenuItemsQuery() {
  return useQuery({
    queryKey: menuItemQueryKeys.lists(),
    queryFn: getMenuItems,
  });
}

export function useCreateMenuItemMutation() {
  const { setListCache, invalidateList } = useMenuItemListCache();

  const mutation = useMutation({
    mutationFn: (payload: CreateMenuItemRequest) => createMenuItem(payload),
    onSuccess: (createdItem) => {
      setListCache((current) =>
        upsertEntityByKey(current, createdItem, "menu_item_id"),
      );

      toast.success("Menu berhasil ditambahkan.", {
        description: `${createdItem.menu_item_name} siap ditampilkan.`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
    onSettled: () => {
      invalidateList();
    },
  });

  return {
    createMenuItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useUpdateMenuItemMutation() {
  const { queryClient, setListCache, invalidateList } = useMenuItemListCache();

  const mutation = useMutation({
    mutationFn: (input: UpdateMenuItemInput) => updateMenuItem(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: menuItemQueryKeys.lists() });

      const previous =
        queryClient.getQueryData<MenuItemEntity[]>(menuItemQueryKeys.lists()) ??
        [];

      setListCache((current) =>
        current.map((item) =>
          item.menu_item_id === input.menu_item_id
            ? {
                ...item,
                ...input.payload,
                image_url: input.payload.image_url ?? "",
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );

      return { previous };
    },
    onSuccess: (updatedItem) => {
      setListCache((current) =>
        upsertEntityByKey(current, updatedItem, "menu_item_id"),
      );

      toast.success("Menu berhasil diperbarui.", {
        description: `${updatedItem.menu_item_name} telah diperbarui.`,
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(menuItemQueryKeys.lists(), context.previous);
      }

      handleApiError(error);
    },
    onSettled: () => {
      invalidateList();
    },
  });

  return {
    updateMenuItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useDeleteMenuItemMutation() {
  const { queryClient, setListCache, invalidateList } = useMenuItemListCache();

  const mutation = useMutation({
    mutationFn: (input: DeleteMenuItemInput) => deleteMenuItem(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: menuItemQueryKeys.lists() });

      const previous =
        queryClient.getQueryData<MenuItemEntity[]>(menuItemQueryKeys.lists()) ??
        [];
      const target = previous.find(
        (item) => item.menu_item_id === input.menu_item_id,
      );

      setListCache((current) =>
        removeEntityByKey(current, "menu_item_id", input.menu_item_id),
      );

      return {
        previous,
        deletedName: target?.menu_item_name ?? "Menu",
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
        queryClient.setQueryData(menuItemQueryKeys.lists(), context.previous);
      }

      handleApiError(error);
    },
    onSettled: () => {
      invalidateList();
    },
  });

  return {
    deleteMenuItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export type { MenuCategoryEntity, MenuItemEntity };
