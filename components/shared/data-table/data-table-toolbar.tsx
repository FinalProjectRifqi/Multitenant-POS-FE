import type { Table } from "@tanstack/react-table";
import { Plus, Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DataTableToolbarProps<T> = {
  table: Table<T>;
  /** The accessorKey of the column whose filterFn handles searching */
  searchColumn?: string;
  searchPlaceholder?: string;
  /** Pass null to hide the action button entirely */
  actionLabel?: string | null;
  onActionClick?: () => void;
  /** Extra controls rendered between the search box and the action button */
  extraControls?: ReactNode;
};

export function DataTableToolbar<T>({
  table,
  searchColumn,
  searchPlaceholder = "Search...",
  actionLabel,
  onActionClick,
  extraControls,
}: DataTableToolbarProps<T>) {
  const column = searchColumn ? table.getColumn(searchColumn) : undefined;
  const searchValue = (column?.getFilterValue() as string) ?? "";
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="bg-background pl-8"
            value={searchValue}
            onChange={(e) => column?.setFilterValue(e.target.value)}
          />
        </div>

        {isFiltered && (
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

      <div className="flex items-center gap-2">
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
