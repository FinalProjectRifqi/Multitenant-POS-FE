"use client";

import { Badge } from "@/components/ui/badge";
import {
  DetailDialog,
  type DetailFieldDef,
} from "@/components/shared/detail-dialog";
import {
  formatCurrency,
  formatDate,
  getMenuAvailabilityLabel,
} from "@/lib/menu/constants";
import type { MenuItemRow } from "@/lib/menu/types";

const MENU_DETAIL_FIELDS: DetailFieldDef<MenuItemRow>[] = [
  {
    label: "Nama Menu",
    render: (item) => item.menu_item_name,
  },
  {
    label: "Kategori",
    render: (item) => item.category_name,
  },
  {
    label: "Harga",
    render: (item) => formatCurrency(item.item_price),
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
    label: "URL Gambar",
    render: (item) =>
      item.image_url ? (
        <a
          href={item.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 text-sm break-all"
        >
          {item.image_url}
        </a>
      ) : (
        <span className="text-muted-foreground italic">Tidak ada gambar</span>
      ),
  },
  {
    label: "Dibuat",
    render: (item) => formatDate(item.created_at),
  },
  {
    label: "Terakhir Diperbarui",
    render: (item) => formatDate(item.updated_at),
  },
];

type MenuDetailDialogProps = {
  menuItem: MenuItemRow | null;
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
