import type { CreateMenuRequest } from "@/lib/schemas/menu";

export const DEFAULT_MENU_ITEM_FORM_VALUES: CreateMenuRequest = {
  menu_name: "",
  menu_category_id: "",
  item_price: 0,
  is_available: true,
  menu_image: undefined,
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | undefined): string {
  if (!value) return "-";
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
