"use client";

import { Badge } from "@/components/ui/badge";
import {
  DetailDialog,
  type DetailFieldDef,
} from "@/components/shared/detail-dialog";
import {
  formatCurrency,
  getMenuAvailabilityLabel,
} from "@/lib/menu/constants";
import type { MenuRow } from "@/lib/menu/types";

const MENU_DETAIL_FIELDS: DetailFieldDef<MenuRow>[] = [
  {
    label: "Nama Menu",
    render: (item) => item.menu_name,
  },
  {
    label: "Kategori",
    render: (item) => item.menu_category_name,
  },
  {
    label: "Unit Usaha",
    render: (item) => item.business_unit_name ?? "-",
  },
  {
    label: "Harga",
    render: (item) => formatCurrency(item.menu_price),
  },
  {
    label: "Status Ketersediaan",
    render: (item) => (
      <Badge
        variant="outline"
        className={
          item.is_available
            ? "border-green-200 bg-green-100 text-green-700"
            : "border-zinc-200 bg-zinc-100 text-zinc-600"
        }
      >
        {getMenuAvailabilityLabel(item.is_available)}
      </Badge>
    ),
  },
  {
    label: "Gambar Menu",
    render: (item) =>
      item.menu_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.menu_image}
          alt={item.menu_name}
          className="h-32 w-auto rounded-md object-cover border"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="text-muted-foreground italic">Tidak ada gambar</span>
      ),
  },
];

type MenuDetailDialogProps = {
  menuItem: MenuRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MenuDetailDialog({
  menuItem,
  open,
  onOpenChange,
}: MenuDetailDialogProps) {
  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      data={menuItem}
      title="Detail Menu"
      description="Informasi lengkap mengenai item menu"
      fields={MENU_DETAIL_FIELDS}
    />
  );
}
