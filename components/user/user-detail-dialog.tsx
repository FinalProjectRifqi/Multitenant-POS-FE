"use client";

import {
  DetailDialog,
  type DetailFieldDef,
} from "@/components/shared/detail-dialog";
import { Badge } from "@/components/ui/badge";
import type { UserEntity } from "@/lib/types/user";
import { formatDate, STATUS_LABEL } from "@/lib/user/constants";

function formatUnits(user: UserEntity) {
  const units = user.business_units ?? [];
  if (units.length === 0) return "-";
  return units.map((unit) => unit.business_unit_name).join(", ");
}

const USER_DETAIL_FIELDS: DetailFieldDef<UserEntity>[] = [
  { label: "Nama Lengkap", render: (user) => user.full_name },
  { label: "Username", render: (user) => user.user_name },
  { label: "Email", render: (user) => user.email },
  { label: "Role", render: (user) => user.role_name },
  { label: "Unit Usaha", render: formatUnits },
  {
    label: "Status",
    render: (user) => (
      <Badge
        variant="outline"
        className={
          user.status
            ? "border-green-200 bg-green-100 text-green-700"
            : "border-zinc-200 bg-zinc-100 text-zinc-600"
        }
      >
        {STATUS_LABEL[user.status ? "active" : "inactive"]}
      </Badge>
    ),
  },
  {
    label: "Login Terakhir",
    render: (user) => (user.last_login ? formatDate(user.last_login) : "-"),
  },
];

type UserDetailDialogProps = {
  user: UserEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      data={user}
      title="Detail Pengguna"
      description="Informasi lengkap mengenai pengguna"
      fields={USER_DETAIL_FIELDS}
    />
  );
}
