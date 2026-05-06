import { z } from "zod";

// ─── ID schemas ────────────────────────────────────────────────────────────────

export const menuCategoryIdSchema = z
  .string()
  .uuid("ID kategori menu tidak valid");

export const menuIdSchema = z.string().uuid("ID menu tidak valid");

// ─── Write payloads (form → API) ───────────────────────────────────────────────

/**
 * Fields submitted when creating or updating a menu item.
 * The API accepts multipart/form-data; we keep this as a plain object and
 * let the server-action layer convert it to FormData.
 */
const menuWritePayloadSchema = z.object({
  menu_name: z
    .string()
    .trim()
    .min(3, "Nama menu minimal 3 karakter")
    .max(120, "Nama menu maksimal 120 karakter"),
  menu_category_id: menuCategoryIdSchema,
  item_price: z.coerce
    .number()
    .nonnegative("Harga menu tidak boleh negatif")
    .max(1_000_000_000, "Harga menu terlalu besar"),
  is_available: z.boolean(),
  /**
   * For CREATE/UPDATE: a File object selected by the user.
   * For EDIT initial values: a string URL (shown as preview only — never re-submitted).
   * Omit or leave undefined to keep the existing image on PATCH.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menu_image: z.any().optional(),
});

export const createMenuRequestSchema = menuWritePayloadSchema;
export type CreateMenuRequest = z.infer<typeof createMenuRequestSchema>;

export const updateMenuRequestSchema = menuWritePayloadSchema.partial();
export type UpdateMenuRequest = z.infer<typeof updateMenuRequestSchema>;

export const deleteMenuRequestSchema = z.object({
  menu_id: menuIdSchema,
});
export type DeleteMenuRequest = z.infer<typeof deleteMenuRequestSchema>;

// ─── API response entity ───────────────────────────────────────────────────────

const priceFromApiSchema = z
  .union([z.number(), z.string()])
  .transform((v) => {
    const n = typeof v === "number" ? v : Number(v);
    return n;
  })
  .refine((v) => Number.isFinite(v), "Harga menu tidak valid");

/**
 * Represents a single menu item as returned by the real API.
 */
export const menuEntitySchema = z.object({
  menu_id: menuIdSchema,
  menu_name: z.string(),
  menu_category_id: menuCategoryIdSchema,
  menu_category_name: z.string(),
  menu_price: priceFromApiSchema,
  menu_image: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() ?? ""),
  business_unit_id: z.string().uuid().optional(),
  business_unit_name: z.string().optional(),
  is_available: z.boolean(),
});

export type MenuEntity = z.infer<typeof menuEntitySchema>;

// ─── List response ─────────────────────────────────────────────────────────────

const menuMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const menusListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(menuEntitySchema),
  meta: menuMetaSchema,
});

export type MenusListResponse = z.infer<typeof menusListResponseSchema>;

// ─── Single-item responses (create / update) ──────────────────────────────────

export const menuResponseSchema = z.union([
  menuEntitySchema,
  z
    .object({ data: menuEntitySchema })
    .transform((payload) => payload.data),
]);
