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
import type { UnitEntity } from "@/lib/types/unit";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/unit/constants";

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
      accessorKey: "business_unit_name",
      header: "Nama Unit",
      // Multi-field search: this single filterFn covers all searchable fields
      filterFn: (row, _colId, filterValue: string) => {
        const u = row.original;
        const query = filterValue.toLowerCase();
        return [
          u.business_unit_name,
          u.business_unit_address,
          u.business_unit_phone,
          STATUS_LABEL[u.business_unit_status === true ? "active" : "inactive"],
        ].some((field) => field.toLowerCase().includes(query));
      },
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.getValue("business_unit_name")}
        </span>
      ),
    },
    {
      accessorKey: "business_unit_address",
      header: "Alamat",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="max-w-md text-foreground/85">
          {row.getValue("business_unit_address")}
        </span>
      ),
    },
    {
      accessorKey: "business_unit_phone",
      header: "Nomor Telepon",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {row.getValue("business_unit_phone")}
        </span>
      ),
    },
    {
      accessorKey: "business_unit_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<UnitEntity["business_unit_status"]>(
          "business_unit_status",
        );
        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              status === true
                ? "bg-green-100 text-green-700"
                : "bg-zinc-200 text-zinc-700",
            )}
          >
            {STATUS_LABEL[status === true ? "active" : "inactive"]}
          </span>
        );
      },
    },
    // {
    //   accessorKey: "created_at",
    //   header: "Dibuat",
    //   cell: ({ row }) => (
    //     <span className="text-foreground/85">
    //       {formatDate(row.getValue("created_at"))}
    //     </span>
    //   ),
    // },
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
                aria-label={`Aksi untuk ${unit.business_unit_name}`}
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
