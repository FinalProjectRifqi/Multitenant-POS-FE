import { z } from "zod";

export const menuCategorySchema = z.object({
  menu_category_id: z.string().uuid(),
  menu_category_name: z.string(),
  description: z.string().optional().catch(""),
  business_unit_id: z.string().uuid().optional().catch(undefined),
  business_unit_name: z.string().optional().catch(""),
});
export type MenuCategoryEntity = z.infer<typeof menuCategorySchema>;

export const metaSchema = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
  total: z.number().int().optional(),
  totalPages: z.number().int().optional(),
});
export type Meta = z.infer<typeof metaSchema>;

export const menuCategoriesListResponseSchema = z.union([
  z.object({
    data: z.array(menuCategorySchema),
    meta: metaSchema.optional(),
  }),
  z.array(menuCategorySchema).transform((data) => ({ data, meta: undefined })),
]);
export type MenuCategoriesListResponse = z.infer<
  typeof menuCategoriesListResponseSchema
>;
