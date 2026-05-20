"use client";

import { useMemo, useState } from "react";

import { useCrudPageController } from "@/lib/crud/use-crud-page-controller";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../queries/user";
import { useRolesQuery } from "../queries/role";
import { useUnitsQuery } from "../queries/unit";
import { CreateUserRequest, UserEntity } from "../types/user";
import { DEFAULT_USER_FORM_VALUES } from "./constants";
import { buildUserStats } from "./stats";

const ALL_FILTER_VALUE = "all";

export function useUserPage() {
  const [viewingUser, setViewingUser] = useState<UserEntity | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{user_name: string; password?: string} | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL_FILTER_VALUE);
  const [businessUnitFilter, setBusinessUnitFilter] =
    useState(ALL_FILTER_VALUE);

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

  const usersQuery = useUsersQuery(page, limit, sortBy, sortType, search, {
    roleId: roleFilter === ALL_FILTER_VALUE ? undefined : roleFilter,
    businessUnitId:
      businessUnitFilter === ALL_FILTER_VALUE ? undefined : businessUnitFilter,
  });
  const rolesQuery = useRolesQuery();
  const unitsQuery = useUnitsQuery(1, 100, false);
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();

  const roles = rolesQuery.data?.data ?? [];
  const units = (unitsQuery.data?.data ?? []).filter(
    (unit) => unit.business_unit_status,
  );

  function resetPaginationPage() {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function handleRoleFilterChange(value: string) {
    setRoleFilter(value);
    resetPaginationPage();
  }

  function handleBusinessUnitFilterChange(value: string) {
    setBusinessUnitFilter(value);
    resetPaginationPage();
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPaginationPage();
  }

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
    search,
    setSearch: handleSearchChange,
    pagination,
    setPagination,
    filters: {
      roleId: roleFilter,
      businessUnitId: businessUnitFilter,
      allValue: ALL_FILTER_VALUE,
      setRoleId: handleRoleFilterChange,
      setBusinessUnitId: handleBusinessUnitFilterChange,
      roles,
      units,
      isLoadingRoles: rolesQuery.isLoading,
      isLoadingUnits: unitsQuery.isLoading,
    },
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
