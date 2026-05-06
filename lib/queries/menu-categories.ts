"use client";

import { useQuery } from "@tanstack/react-query";
import { getMenuCategories } from "@/lib/api/menu-categories";

export const menuCategoryQueryKeys = {
  all: ["menu-categories"] as const,
  lists: () => [...menuCategoryQueryKeys.all, "list"] as const,
  list: (business_unit_id: string) => [...menuCategoryQueryKeys.lists(), business_unit_id] as const,
};

export function useMenuCategoriesQuery({
  business_unit_id,
}: {
  business_unit_id: string;
}) {
  return useQuery({
    queryKey: menuCategoryQueryKeys.list(business_unit_id),
    queryFn: () => getMenuCategories({ business_unit_id }),
    enabled: !!business_unit_id,
  });
}
