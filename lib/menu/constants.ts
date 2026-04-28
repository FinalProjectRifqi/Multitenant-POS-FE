import type { CreateMenuItemRequest } from "@/lib/schemas/menu";

export const DEFAULT_MENU_ITEM_FORM_VALUES: CreateMenuItemRequest = {
  menu_category_id: "",
  menu_item_name: "",
  image_url: "",
  item_price: 0,
  is_available: true,
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getMenuAvailabilityLabel(isAvailable: boolean): string {
  return isAvailable ? "Tersedia" : "Tidak Tersedia";
}
