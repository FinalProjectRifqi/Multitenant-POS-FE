"use client";

import { cn } from "@/lib/utils";
import {
  DetailDialog,
  type DetailFieldDef,
} from "@/components/shared/detail-dialog";
import type { InventarisRow } from "@/lib/inventaris/types";

const INVENTARIS_DETAIL_FIELDS: DetailFieldDef<InventarisRow>[] = [
  {
    label: "Nama Barang",
    render: (item) => item.inventory_item_name,
  },
  {
    label: "Satuan Pengukuran",
    render: (item) => item.unit_of_measure,
  },
  {
    label: "Stok Saat Ini",
    render: (item) => item.current_stock,
    valueClassName: (item) =>
      cn(item.is_low_stock ? "text-destructive font-semibold" : ""),
  },
  {
    label: "Batas Maksimum Stok",
    render: (item) => item.max_threshold,
  },
  {
    label: "Batas Minimum Stok",
    render: (item) => item.min_threshold,
  },
  {
    label: "Deskripsi Barang Inventaris",
    render: (item) =>
      item.description || (
        <span className="text-muted-foreground italic">
          Tidak ada deskripsi
        </span>
      ),
  },
];

type InventarisDetailDialogProps = {
  item: InventarisRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InventarisDetailDialog({
  item,
  open,
  onOpenChange,
}: InventarisDetailDialogProps) {
  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      data={item}
      title="Detail Barang Inventaris"
      description="Informasi Lengkap mengenai Barang Inventaris"
      fields={INVENTARIS_DETAIL_FIELDS}
    />
  );
}
