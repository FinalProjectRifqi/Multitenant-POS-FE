import { useMemo, useState } from "react";

/**
 * Generic client-side search filter.
 * NOTE: When using DataTable with TanStack, filtering is handled internally
 * via columnFilters. Use this hook only for non-table filtered lists.
 *
 * @example
 * const { searchValue, setSearchValue, filtered } = useSearchFilter(
 *   units,
 *   (u) => [u.unit_name, u.unit_address, STATUS_LABEL[u.status]],
 * );
 */
export function useSearchFilter<T>(
  items: T[],
  getFields: (item: T) => string[],
) {
  const [searchValue, setSearchValue] = useState("");

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      getFields(item).some((field) => field.toLowerCase().includes(query)),
    );
  }, [items, searchValue, getFields]);

  return { searchValue, setSearchValue, filtered };
}
