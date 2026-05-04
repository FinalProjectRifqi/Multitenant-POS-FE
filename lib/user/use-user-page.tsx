"use client";

import { useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/user";
import { CreateUserRequest, UserEntity } from "../types/user";
import { DEFAULT_USER_FORM_VALUES } from "./constants";
import { buildUserStats } from "./stats";

export function useUserPage() {
  const [viewingUser, setViewingUser] = useState<UserEntity | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{user_name: string; password?: string} | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [showInactive, setShowInactive] = useState(true);

  // API uses 1-based indexing for page
  const page = pagination.pageIndex + 1;
  const limit = pagination.pageSize;
  const sortBy:
    | "full_name"
    | "username"
    | "business_unit_name"
    | "role_name"
    | "status"
    | "last_login" = "last_login";
  const sortType: "ASC" | "DESC" = "DESC";
  const search = "";

  const usersQuery = useUsersQuery(page, limit, sortBy, sortType, search);
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const controller = useCrudPageController({
    defaultFormValues: DEFAULT_USER_FORM_VALUES,
    listQuery: {
      data: usersQuery.data?.data,
      meta: usersQuery.data?.meta,
      isLoading: usersQuery.isLoading,
      isError: usersQuery.isError,
      error: usersQuery.error,
    },
    createMutation: {
      execute: createMutation.createUser,
      isPending: createMutation.isPending,
      error: createMutation.error,
    },
    updateMutation: {
      execute: updateMutation.updateUser,
      isPending: updateMutation.isPending,
      error: updateMutation.error,
    },
    deleteMutation: {
      execute: deleteMutation.deleteUser,
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
    },
    mapEntityToFormValues: (user: UserEntity): CreateUserRequest => {
      const { full_name, user_name, email, role_id, business_units } = user;
      return {
        full_name,
        user_name,
        email,
        role_id,
        business_unit_id: business_units?.[0]?.business_unit_id,
        password: "", // password is not returned by API, so we can't pre-fill it in the form
      };
    },
    toUpdateInput: ({ entity, values }) => ({
      user_id: entity.user_id,
      payload: values,
    }),
    toDeleteInput: (entity) => ({
      user_id: entity.user_id,
    }),
  });

  const visibleUsers = useMemo(
    () =>
      showInactive
        ? controller.items
        : controller.items.filter((user) => user.status),
    [controller.items, showInactive],
  );

  const stats = useMemo(() => buildUserStats(visibleUsers), [visibleUsers]);

  return {
    users: visibleUsers,
    stats,
    editInitialValues: controller.editInitialValues,
    query: controller.query,
    isCreateOpen: controller.isCreateOpen,
    setIsCreateOpen: controller.setIsCreateOpen,
    editingUser: controller.editingItem,
    setEditingUser: controller.setEditingItem,
    deletingUser: controller.deletingItem,
    setDeletingUser: controller.setDeletingItem,
    viewingUser,
    setViewingUser,
    showInactive,
    setShowInactive,
    pagination,
    setPagination,
    create: {
      ...controller.create,
      handle: async (values: CreateUserRequest) => {
        await controller.create.handle(values);
        setCreatedCredentials({
          user_name: values.user_name,
          password: values.password,
        });
      },
    },
    update: controller.update,
    delete: controller.delete,
    createdCredentials,
    setCreatedCredentials,
  };
}
