"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { PaginationMeta } from "@/lib/schemas/unit";

type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  // Loading
  isLoading?: boolean;
  skeletonRows?: number;
  // Empty states
  emptyMessage?: string;
  searchEmptyMessage?: string;
  // Toolbar
  searchColumn?: string;
  searchPlaceholder?: string;
  actionLabel?: string | null;
  onActionClick?: () => void;
  extraControls?: ReactNode;
  // Features — all opt-in
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableRowSelection?: boolean;
  defaultPageSize?: number;
  initialVisibility?: VisibilityState;
  meta?: PaginationMeta;
  pagination?: PaginationState;
  onPaginationChange?: (updater: any) => void;
};

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = "Belum ada data.",
  searchEmptyMessage = "Data tidak ditemukan.",
  searchColumn,
  searchPlaceholder,
  actionLabel,
  onActionClick,
  extraControls,
  enablePagination = true,
  enableSorting = true,
  enableRowSelection = false,
  defaultPageSize = 10,
  initialVisibility = {},
  meta,
  pagination,
  onPaginationChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialVisibility);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { 
      sorting, 
      columnVisibility, 
      rowSelection, 
      ...(pagination && { pagination }) 
    },
    initialState: { pagination: { pageSize: defaultPageSize } },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(onPaginationChange && { onPaginationChange }),
    manualPagination: !!pagination,
    pageCount: meta?.totalPages ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isFiltered = table.getState().columnFilters.length > 0;
  const rows = table.getRowModel().rows;

  const showToolbar = searchColumn != null || actionLabel != null;

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          searchColumn={searchColumn}
          searchPlaceholder={searchPlaceholder}
          actionLabel={actionLabel}
          onActionClick={onActionClick}
          extraControls={extraControls}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-border/90">
        <Table>
          <TableHeader className="bg-muted/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = enableSorting && header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : ""}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <span className="text-muted-foreground">
                              {sorted === "asc" ? (
                                <ArrowUp className="size-3.5" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="size-3.5" />
                              ) : (
                                <ArrowUpDown className="size-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRows }, (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell colSpan={columns.length} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-muted-foreground"
                >
                  {isFiltered ? searchEmptyMessage : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && <DataTablePagination table={table} meta={meta} />}
    </div>
  );
}
