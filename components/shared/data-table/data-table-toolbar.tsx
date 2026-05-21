import type { Table } from "@tanstack/react-table";
import { Plus, Search, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

type DataTableToolbarProps<T> = {
  table: Table<T>;
  /** The accessorKey of the column whose filterFn handles searching */
  searchColumn?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Pass null to hide the action Button entirely */
  actionLabel?: string | null;
  onActionClick?: () => void;
  /** Extra controls rendered between the search box and the action Button */
  extraControls?: ReactNode;
};

export function DataTableToolbar<T>({
  table,
  searchColumn,
  searchPlaceholder = "Search...",
  searchValue: controlledSearchValue,
  onSearchChange,
  actionLabel,
  onActionClick,
  extraControls,
}: DataTableToolbarProps<T>) {
  const column = searchColumn ? table.getColumn(searchColumn) : undefined;
  const searchValue =
    controlledSearchValue ?? ((column?.getFilterValue() as string) || "");
  const [searchInput, setSearchInput] = useState(searchValue);
  const lastSyncedSearchValue = useRef(searchValue);
  const debouncedSearchInput = useDebounce(searchInput, 600);
  const isFiltered = table.getState().columnFilters.length > 0;
  const showSearch = onSearchChange != null || column != null;

  useEffect(() => {
    if (searchValue === lastSyncedSearchValue.current) return;

    lastSyncedSearchValue.current = searchValue;
    setSearchInput(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (!onSearchChange) return;

    const nextValue = debouncedSearchInput.trim();
    if (nextValue === (controlledSearchValue ?? "")) return;

    onSearchChange(nextValue);
  }, [controlledSearchValue, debouncedSearchInput, onSearchChange]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {showSearch && (
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="bg-background pl-8 py-5"
              value={onSearchChange ? searchInput : searchValue}
              onChange={(e) => {
                const nextValue = e.target.value;
                if (onSearchChange) {
                  setSearchInput(nextValue);
                  return;
                }

                column?.setFilterValue(nextValue);
              }}
            />
          </div>
        )}

        {!onSearchChange && isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 text-muted-foreground"
          >
            Reset
            <X className="ml-1 size-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {extraControls}
        {actionLabel && (
          <Button
            className="h-9 gap-2 px-4 text-sm font-semibold"
            onClick={onActionClick}
          >
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
