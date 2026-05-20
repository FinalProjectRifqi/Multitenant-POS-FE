import { CreateUserRequest, UserStatus } from "../types/user";

export const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
};

export const DEFAULT_USER_FORM_VALUES: CreateUserRequest = {
  full_name: "",
  user_name: "",
  email: "",
  password: "",
  role_id: "",
  business_unit_id: null,
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
