"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";

import {
  DeleteUserInput,
  UpdateUserInput,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/lib/api/users";
import { removeEntityByKey, upsertEntityByKey } from "@/lib/queries/crud";
import { UsersListResponse } from "@/lib/schemas/user";
import { CreateUserRequest, UserEntity } from "@/lib/types/user";
import { formatApiError } from "../api/parsed-api-error";
import { currentUserQueryKeys } from "./current-user";
import { userQueryKeys } from "./user-keys";
import {
  shouldHandleMutationErrorGlobally,
  handleApiError,
} from "../api/handle-api-error";

type UserListFilters = {
  roleId?: string;
  businessUnitId?: string;
};

function useUserListCache() {
  const queryClient = useQueryClient();

  const setListCache = (updater: (current: UserEntity[]) => UserEntity[]) => {
    queryClient.setQueriesData<UsersListResponse>(
      { queryKey: userQueryKeys.lists() },
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
    queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
  const invalidateCurrentUser = () =>
    queryClient.invalidateQueries({
      queryKey: currentUserQueryKeys.currentUser(),
    });

  return {
    queryClient,
    setListCache,
    invalidateList,
    invalidateCurrentUser,
  };
}

export function useUsersQuery(
  page = 1,
  limit = 10,
  sortBy:
    | "full_name"
    | "username"
    | "business_unit_name"
    | "role_name"
    | "status"
    | "last_login" = "last_login",
  sortType: "ASC" | "DESC" = "DESC",
  search = "",
  filters: UserListFilters = {},
) {
  const role_id = filters.roleId || undefined;
  const business_unit_id = filters.businessUnitId || undefined;
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: [
      ...userQueryKeys.lists(),
      {
        page,
        limit,
        sortBy,
        sortType,
        search: normalizedSearch,
        role_id,
        business_unit_id,
      },
    ],
    queryFn: () =>
      getUsers({
        page,
        limit,
        sortBy,
        sortType,
        search: normalizedSearch || undefined,
        role_id,
        business_unit_id,
      }),
    meta: {
      errorTitle: "Gagal Memuat User",
    },
  });
}

export function useCreateUserMutation() {
  const { setListCache, invalidateList, invalidateCurrentUser } =
    useUserListCache();

  const mutation = useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      const result = await createUser(payload);

      if (!result.ok) {
        throw formatApiError(result.status, result.message);
      }
      return result.data;
    },
    onSuccess: (createdUser) => {
      setListCache((current) =>
        upsertEntityByKey(current, createdUser, "user_id"),
      );

      toast.success("Pengguna berhasil ditambahkan.", {
        description: `${createdUser.user_name} siap digunakan.`,
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
      void invalidateCurrentUser();
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useUpdateUserMutation() {
  const { queryClient, setListCache, invalidateList, invalidateCurrentUser } =
    useUserListCache();

  const mutation = useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const result = await updateUser(input);

      if (!result.ok) {
        throw formatApiError(result.status, result.message);
      }
      return result.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.lists() });

      const previous = queryClient.getQueriesData<UsersListResponse>({
        queryKey: userQueryKeys.lists(),
      });

      setListCache((current) =>
        current.map((user) =>
          user.user_id === input.user_id
            ? {
                ...user,
                ...input.payload,
              }
            : user,
        ),
      );

      return { previous };
    },
    onSuccess: (updatedUser) => {
      setListCache((current) =>
        upsertEntityByKey(current, updatedUser, "user_id"),
      );

      toast.success("Pengguna berhasil diperbarui.", {
        description: `${updatedUser.user_name} telah diperbarui.`,
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
      void invalidateCurrentUser();
    },
  });

  return {
    updateUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useDeleteUserMutation() {
  const { queryClient, setListCache, invalidateList, invalidateCurrentUser } =
    useUserListCache();

  const mutation = useMutation({
    mutationFn: async (input: DeleteUserInput) => {
      const result = await deleteUser(input);

      if (!result.ok) {
        throw formatApiError(result.status, result.message);
      }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.lists() });

      const previous = queryClient.getQueriesData<UsersListResponse>({
        queryKey: userQueryKeys.lists(),
      });

      let target: UserEntity | undefined;
      previous.forEach(([, data]) => {
        if (!target && data?.data) {
          target = data.data.find((item) => item.user_id === input.user_id);
        }
      });

      setListCache((current) =>
        removeEntityByKey(current, "user_id", input.user_id),
      );

      return {
        previous,
        deletedName: target?.user_name ?? "Pengguna",
      };
    },
    onSuccess: (_result, _input, context) => {
      toast.success("Pengguna berhasil dihapus.", {
        description: `${context?.deletedName ?? "Pengguna"} telah dihapus.`,
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
      void invalidateCurrentUser();
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
