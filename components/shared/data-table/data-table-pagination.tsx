"use client";

import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginationMeta } from "@/lib/schemas/unit";

type DataTablePaginationProps<T> = {
  table: Table<T>;
  pageSizeOptions?: number[];
  /** When provided, uses server-side meta instead of client-side table state */
  meta?: PaginationMeta;
};

export function DataTablePagination<T>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
  meta,
}: DataTablePaginationProps<T>) {
  // ── Derived state: prefer server meta, fall back to client table state ───────
  const currentPage = meta
    ? meta.page
    : table.getState().pagination.pageIndex + 1;
  const totalPages = meta ? meta.totalPages : table.getPageCount();
  const pageSize = meta ? meta.limit : table.getState().pagination.pageSize;
  const totalRows = meta?.total;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  // table.setPageIndex always uses 0-based index internally
  const goToFirst = () => table.setPageIndex(0);
  const goToPrev = () => table.setPageIndex(currentPage - 2); // currentPage is 1-based
  const goToNext = () => table.setPageIndex(currentPage); // currentPage is 1-based, so this = next 0-based
  const goToLast = () => table.setPageIndex(totalPages - 1);
  const onSizeChange = (v: string) => {
    table.setPageSize(Number(v));
    table.setPageIndex(0); // reset to first page on size change
  };

  return (
    <div className="flex flex-col items-center justify-end gap-3 sm:flex-row">
      {/* Total rows info */}
      {totalRows !== undefined && (
        <p className="mr-auto text-sm text-muted-foreground">
          Total {totalRows} data
        </p>
      )}

      <div className="flex items-center gap-6">
        {/* Page size */}
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-sm font-medium">
            Baris per halaman
          </p>
          <Select value={String(pageSize)} onValueChange={onSizeChange}>
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <p className="whitespace-nowrap text-sm font-medium">
          Halaman {currentPage} dari {totalPages}
        </p>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToFirst}
            disabled={!canPrev}
            aria-label="Halaman pertama"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToPrev}
            disabled={!canPrev}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToNext}
            disabled={!canNext}
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToLast}
            disabled={!canNext}
            aria-label="Halaman terakhir"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
