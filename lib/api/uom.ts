"use server";

import { z } from "zod";

import { apiGet } from "@/lib/api/client";

const unitOfMaterialSchema = z.object({
  unit_of_material_id: z.string(),
  unit_of_material_name: z.string(),
  unit_of_material_code: z.string(),
});

const unitOfMaterialsListResponseSchema = z
  .object({
    data: z.array(unitOfMaterialSchema),
  })
  .passthrough();

type UnitOfMaterialsListResponse = z.infer<
  typeof unitOfMaterialsListResponseSchema
>;

export type UomOption = {
  code: string;
  name: string;
};

const UOM_ENDPOINT = "/unit-of-materials";

export async function getUomOptions(): Promise<UomOption[]> {
  const response = await apiGet<UnitOfMaterialsListResponse>(UOM_ENDPOINT, {
    params: { limit: 100 },
    schema: unitOfMaterialsListResponseSchema,
  });

  return response.data.map((unit) => ({
    code: unit.unit_of_material_code,
    name: unit.unit_of_material_name,
  }));
}
