type CrudQueryKeys = {
  all: readonly [string];
  lists: () => readonly [string, "list"];
  detail: (id: string) => readonly [string, "detail", string];
};

export function createCrudQueryKeys(resource: string): CrudQueryKeys {
  const all = [resource] as const;

  return {
    all,
    lists: () => [...all, "list"] as const,
    detail: (id: string) => [...all, "detail", id] as const,
  };
}

export function upsertEntityByKey<
  TEntity extends object,
  TKey extends keyof TEntity,
>(
  current: TEntity[],
  incoming: TEntity,
  key: TKey,
  prependOnInsert = true,
): TEntity[] {
  const existingIndex = current.findIndex(
    (item) => item[key] === incoming[key],
  );

  if (existingIndex < 0) {
    return prependOnInsert ? [incoming, ...current] : [...current, incoming];
  }

  const next = [...current];
  next[existingIndex] = incoming;
  return next;
}

export function removeEntityByKey<
  TEntity extends object,
  TKey extends keyof TEntity,
>(current: TEntity[], key: TKey, value: TEntity[TKey]): TEntity[] {
  return current.filter((item) => item[key] !== value);
}
