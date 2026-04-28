import { z } from "zod";

import { unitIdSchema } from "@/lib/schemas/unit";

export const menuCategoryIdSchema = z
  .string()
  .uuid("ID kategori menu tidak valid");

export const menuItemIdSchema = z.string().uuid("ID menu tidak valid");

const menuItemWritePayloadSchema = z.object({
  menu_category_id: menuCategoryIdSchema,
  menu_item_name: z
    .string()
    .trim()
    .min(3, "Nama menu minimal 3 karakter")
    .max(120, "Nama menu maksimal 120 karakter"),
  image_url: z
    .string()
    .trim()
    .max(500, "URL gambar maksimal 500 karakter")
    .optional(),
  item_price: z.coerce
    .number({
      invalid_type_error: "Harga menu wajib diisi",
    })
    .positive("Harga menu harus lebih dari 0")
    .max(1_000_000_000, "Harga menu terlalu besar"),
  is_available: z.boolean(),
});

export const createMenuItemRequestSchema = menuItemWritePayloadSchema;

export type CreateMenuItemRequest = z.infer<typeof createMenuItemRequestSchema>;

export const updateMenuItemRequestSchema = menuItemWritePayloadSchema;

export type UpdateMenuItemRequest = z.infer<typeof updateMenuItemRequestSchema>;

export const deleteMenuItemRequestSchema = z.object({
  menu_item_id: menuItemIdSchema,
});

export type DeleteMenuItemRequest = z.infer<typeof deleteMenuItemRequestSchema>;

const priceFromApiSchema = z
  .union([z.number(), z.string()])
  .transform((value) => {
    const parsed = typeof value === "number" ? value : Number(value);
    return parsed;
  })
  .refine((value) => Number.isFinite(value), "Harga menu tidak valid");

export const menuCategorySchema = z.object({
  menu_category_id: menuCategoryIdSchema,
  unit_id: unitIdSchema,
  category_name: z.string(),
  description: z.string(),
  is_active: z.boolean(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export type MenuCategoryEntity = z.infer<typeof menuCategorySchema>;

export const menuItemSchema = z.object({
  menu_item_id: menuItemIdSchema,
  menu_category_id: menuCategoryIdSchema,
  menu_item_name: z.string(),
  image_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value?.trim() ?? ""),
  item_price: priceFromApiSchema,
  is_available: z.boolean(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export type MenuItemEntity = z.infer<typeof menuItemSchema>;

export const menuCategoriesListResponseSchema = z.union([
  z.array(menuCategorySchema),
  z
    .object({ data: z.array(menuCategorySchema) })
    .transform((payload) => payload.data),
]);

export const menuItemsListResponseSchema = z.union([
  z.array(menuItemSchema),
  z
    .object({ data: z.array(menuItemSchema) })
    .transform((payload) => payload.data),
]);

export const createMenuItemResponseSchema = z.union([
  menuItemSchema,
  z.object({ data: menuItemSchema }).transform((payload) => payload.data),
]);

export const updateMenuItemResponseSchema = createMenuItemResponseSchema;
