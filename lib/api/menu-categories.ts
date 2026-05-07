"use server";

import { apiGet } from "@/lib/api/client";
import {
  MenuCategoriesListResponse,
  menuCategoriesListResponseSchema,
} from "@/lib/schemas/menu-category";
import { menuCategoryIdSchema } from "../schemas/menu";

function assertValidMenuCategoryId(id: string): string {
  return menuCategoryIdSchema.parse(id);
}

export async function getMenuCategories(params: {
  business_unit_id: string;
  limit?: number;
  page?: number;
}): Promise<MenuCategoriesListResponse> {
  const unitId = assertValidMenuCategoryId(params.business_unit_id);

  return apiGet<MenuCategoriesListResponse>("/menu-categories", {
    schema: menuCategoriesListResponseSchema,
    params: {
      business_unit_id: unitId,
      limit: params.limit,
      page: params.page,
    },
  });
}
