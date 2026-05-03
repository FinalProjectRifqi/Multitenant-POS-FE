"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/client";

import {
  createCrudQueryKeys,
  removeEntityByKey,
  upsertEntityByKey,
} from "@/lib/queries/crud";
import {
  getUsers,
  createUser,
  UpdateUserInput,
  updateUser,
  DeleteUserInput,
  deleteUser,
} from "@/lib/api/users";
import { UsersListResponse } from "@/lib/schemas/user";
import { UserEntity, CreateUserRequest } from "@/lib/types/user";

export const userQueryKeys = createCrudQueryKeys("users");

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

  return {
    queryClient,
    setListCache,
    invalidateList,
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
) {
  return useQuery({
    queryKey: [
      ...userQueryKeys.lists(),
      { page, limit, sortBy, sortType, search },
    ],
    queryFn: () => getUsers({ page, limit, sortBy, sortType, search }),
  });
}

export function useCreateUserMutation() {
  const { setListCache, invalidateList } = useUserListCache();

  const mutation = useMutation({
    mutationFn: (payload: CreateUserRequest) => createUser(payload),
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
    createUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useUpdateUserMutation() {
  const { queryClient, setListCache, invalidateList } = useUserListCache();

  const mutation = useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(input),
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
    updateUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}

export function useDeleteUserMutation() {
  const { queryClient, setListCache, invalidateList } = useUserListCache();

  const mutation = useMutation({
    mutationFn: (input: DeleteUserInput) => deleteUser(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.lists() });

      const previous = queryClient.getQueriesData<UsersListResponse>({
        queryKey: userQueryKeys.lists(),
      });

      let target: UserEntity | undefined;
      previous.forEach(([_, data]) => {
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
    deleteUser: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
  };
}
