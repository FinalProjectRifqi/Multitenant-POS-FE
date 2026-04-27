import type { CreateUnitRequest, UnitStatus } from "@/lib/schemas/unit";

export const STATUS_LABEL: Record<UnitStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
};

export const DEFAULT_UNIT_FORM_VALUES: CreateUnitRequest = {
  unit_name: "",
  unit_address: "",
  phone_number: "",
  status: "active",
};

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
