"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatCurrency,
  getMenuAvailabilityLabel,
} from "@/lib/menu/constants";
import type { MenuRow } from "@/lib/menu/types";
import { cn } from "@/lib/utils";

type Actions = {
  onView: (item: MenuRow) => void;
  onEdit: (item: MenuRow) => void;
  onDelete: (item: MenuRow) => void;
};

export function buildMenuItemColumns(
  actions: Actions,
): ColumnDef<MenuRow, unknown>[] {
  return [
    {
      accessorKey: "menu_name",
      header: "Nama Menu",
      filterFn: (row, _colId, filterValue: string) => {
        const item = row.original;
        const query = filterValue.toLowerCase();

        return [
          item.menu_name,
          item.menu_category_name,
          getMenuAvailabilityLabel(item.is_available),
          formatCurrency(item.menu_price),
        ].some((field) => field.toLowerCase().includes(query));
      },
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("menu_name")}
        </span>
      ),
    },
    {
      accessorKey: "menu_category_name",
      header: "Kategori",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {row.getValue("menu_category_name")}
        </span>
      ),
    },
    {
      accessorKey: "menu_price",
      header: "Harga",
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {formatCurrency(row.getValue("menu_price"))}
        </span>
      ),
    },
    {
      accessorKey: "is_available",
      header: "Status",
      cell: ({ row }) => {
        const isAvailable = row.getValue<boolean>("is_available");

        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-zinc-200 text-zinc-700",
            )}
          >
            {getMenuAvailabilityLabel(isAvailable)}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Aksi untuk ${item.menu_name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
              <DropdownMenuItem
                onSelect={() => {
                  actions.onView(item);
                }}
              >
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  actions.onEdit(item);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  actions.onDelete(item);
                }}
              >
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
