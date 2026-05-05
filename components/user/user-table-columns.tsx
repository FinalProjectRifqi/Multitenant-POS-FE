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
import type { UserEntity } from "@/lib/types/user";
import { formatDate, STATUS_LABEL } from "@/lib/user/constants";
import { cn } from "@/lib/utils";

type Actions = {
  onEdit: (user: UserEntity) => void;
  onDelete: (user: UserEntity) => void;
  onView: (user: UserEntity) => void;
};

function formatUnits(user: UserEntity) {
  const units = user.business_units ?? [];
  if (units.length === 0) return "-";
  return units.map((unit) => unit.business_unit_name).join(", ");
}

export function buildUserColumns(
  actions: Actions,
): ColumnDef<UserEntity, unknown>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Nama",
      filterFn: (row, _colId, filterValue: string) => {
        const user = row.original;
        const query = filterValue.toLowerCase();
        return [
          user.full_name,
          user.user_name,
          user.email,
          user.role_name,
          formatUnits(user),
          STATUS_LABEL[user.status ? "active" : "inactive"],
        ].some((field) => field.toLowerCase().includes(query));
      },
      cell: ({ row }) => (
        <div className="min-w-44">
          <p className="font-medium text-foreground">
            {row.original.full_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.user_name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-foreground/85">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role_name",
      header: "Role",
      cell: ({ row }) => (
        <span className="text-foreground/85">{row.original.role_name}</span>
      ),
    },
    {
      id: "business_units",
      header: "Unit Usaha",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="max-w-56 text-foreground/85">
          {formatUnits(row.original)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              status
                ? "bg-green-100 text-green-700"
                : "bg-zinc-200 text-zinc-700",
            )}
          >
            {STATUS_LABEL[status ? "active" : "inactive"]}
          </span>
        );
      },
    },
    {
      accessorKey: "last_login",
      header: "Login Terakhir",
      cell: ({ row }) => (
        <span className="text-foreground/85">
          {row.original.last_login ? formatDate(row.original.last_login) : "-"}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Aksi untuk ${user.user_name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
              <DropdownMenuItem onSelect={() => actions.onView(user)}>
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => actions.onEdit(user)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => actions.onDelete(user)}
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
