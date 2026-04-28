import type { MenuItemEntity } from "@/lib/schemas/menu";

export type MenuItemRow = MenuItemEntity & {
  category_name: string;
  unit_id: string;
};
