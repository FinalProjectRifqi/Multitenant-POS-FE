import type { MenuEntity } from "@/lib/schemas/menu";

/**
 * MenuRow is the display-ready type passed to table columns and detail dialogs.
 * It extends MenuEntity with a convenience `category_name` alias
 * (already present in MenuEntity as `menu_category_name`, kept for compatibility).
 */
export type MenuRow = MenuEntity

/**
 * @deprecated Use MenuRow instead.
 */
export type MenuItemRow = MenuRow;
