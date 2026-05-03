"use client";

import { useMemo, useState } from "react";

type CrudListQuery<TEntity, TMeta = unknown> = {
  data?: TEntity[];
  meta?: TMeta;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

type CrudMutation<TInput, TError = string | null> = {
  execute: (input: TInput) => Promise<unknown>;
  isPending: boolean;
  error: TError;
};

type BuildUpdateInputParams<TEntity, TFormValues> = {
  entity: TEntity;
  values: TFormValues;
};

type UseCrudPageControllerOptions<
  TEntity,
  TFormValues,
  TUpdateInput,
  TDeleteInput,
  TError = string | null,
> = {
  defaultFormValues: TFormValues;
  listQuery: CrudListQuery<TEntity, unknown>;
  createMutation: CrudMutation<TFormValues, TError>;
  updateMutation: CrudMutation<TUpdateInput, TError>;
  deleteMutation: CrudMutation<TDeleteInput, TError>;
  mapEntityToFormValues: (entity: TEntity) => TFormValues;
  toUpdateInput: (
    params: BuildUpdateInputParams<TEntity, TFormValues>,
  ) => TUpdateInput;
  toDeleteInput: (entity: TEntity) => TDeleteInput;
};

export function useCrudPageController<
  TEntity,
  TFormValues,
  TUpdateInput,
  TDeleteInput,
  TError = string | null,
>({
  defaultFormValues,
  listQuery,
  createMutation,
  updateMutation,
  deleteMutation,
  mapEntityToFormValues,
  toUpdateInput,
  toDeleteInput,
}: UseCrudPageControllerOptions<
  TEntity,
  TFormValues,
  TUpdateInput,
  TDeleteInput,
  TError
>) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TEntity | null>(null);
  const [deletingItem, setDeletingItem] = useState<TEntity | null>(null);

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  const editInitialValues = useMemo(() => {
    if (!editingItem) return defaultFormValues;
    return mapEntityToFormValues(editingItem);
  }, [defaultFormValues, editingItem, mapEntityToFormValues]);

  async function handleCreate(values: TFormValues) {
    await createMutation.execute(values);
    setIsCreateOpen(false);
  }

  async function handleUpdate(values: TFormValues) {
    if (!editingItem) return;

    await updateMutation.execute(
      toUpdateInput({ entity: editingItem, values }),
    );
    setEditingItem(null);
  }

  async function handleDelete() {
    if (!deletingItem) return;

    await deleteMutation.execute(toDeleteInput(deletingItem));
    setDeletingItem(null);
  }

  return {
    items,
    editInitialValues,

    query: {
      isLoading: listQuery.isLoading,
      isError: listQuery.isError,
      error: listQuery.error,
      meta: listQuery.meta,
    },

    isCreateOpen,
    setIsCreateOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,

    create: {
      isPending: createMutation.isPending,
      error: createMutation.error,
      handle: handleCreate,
    },
    update: {
      isPending: updateMutation.isPending,
      error: updateMutation.error,
      handle: handleUpdate,
    },
    delete: {
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
      handle: handleDelete,
    },
  };
}
