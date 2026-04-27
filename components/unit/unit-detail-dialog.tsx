"use client";

import { Badge } from "@/components/ui/badge";
import {
  DetailDialog,
  type DetailFieldDef,
} from "@/components/shared/detail-dialog";
import type { UnitEntity } from "@/lib/schemas/unit";
import { STATUS_LABEL } from "@/lib/unit/constants";
import { formatDate } from "@/lib/unit/constants";

const UNIT_DETAIL_FIELDS: DetailFieldDef<UnitEntity>[] = [
  {
    label: "Nama Unit Usaha",
    render: (u) => u.unit_name,
  },
  {
    label: "Alamat",
    render: (u) => u.unit_address,
  },
  {
    label: "Nomor Telepon",
    render: (u) => u.phone_number,
  },
  {
    label: "Status Keaktifan Unit Usaha",
    render: (u) => (
      <Badge
        variant="outline"
        className={
          u.status === "active"
            ? "border-green-200 bg-green-100 text-green-700"
            : "border-zinc-200 bg-zinc-100 text-zinc-600"
        }
      >
        {STATUS_LABEL[u.status]}
      </Badge>
    ),
  },
  {
    label: "Dibuat",
    render: (u) => formatDate(u.created_at),
  },
];

type UnitDetailDialogProps = {
  unit: UnitEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UnitDetailDialog({
  unit,
  open,
  onOpenChange,
}: UnitDetailDialogProps) {
  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      data={unit}
      title="Detail Unit Usaha"
      description="Informasi Lengkap mengenai Unit Usaha"
      fields={UNIT_DETAIL_FIELDS}
    />
  );
}
