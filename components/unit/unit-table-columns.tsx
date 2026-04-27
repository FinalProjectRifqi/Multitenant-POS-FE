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
import type { UnitEntity } from "@/lib/schemas/unit";
import { cn } from "@/lib/utils";
import { formatDate, STATUS_LABEL } from "@/lib/unit/constants";

type Actions = {
  onEdit: (unit: UnitEntity) => void;
  onDelete: (unit: UnitEntity) => void;
  onView: (unit: UnitEntity) => void;
};

export function buildUnitColumns(
  actions: Actions,
): ColumnDef<UnitEntity, unknown>[] {
  return [
    {
      accessorKey: "unit_name",
      header: "Nama Unit",
      // Multi-field search: this single filterFn covers all searchable fields
      filterFn: (row, _colId, filterValue: string) => {
        const u = row.original;
        const query = filterValue.toLowerCase();
        return [
          u.unit_name,
          u.unit_address,
          u.phone_number,
          STATUS_LABEL[u.status],
        ].some((field) => field.toLowerCase().includes(query));
      },
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("unit_name")}
        </span>
      ),
    },
    {
      accessorKey: "unit_address",
      header: "Alamat",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="max-w-md text-foreground/85">
          {row.getValue("unit_address")}
        </span>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Nomor Telepon",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {row.getValue("phone_number")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<UnitEntity["status"]>("status");
        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-zinc-200 text-zinc-700",
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Dibuat",
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {formatDate(row.getValue("created_at"))}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const unit = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Aksi untuk ${unit.unit_name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
              <DropdownMenuItem
                onSelect={() => {
                  actions.onView(unit);
                }}
              >
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  actions.onEdit(unit);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  actions.onDelete(unit);
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
