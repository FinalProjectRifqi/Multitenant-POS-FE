import { apiGet } from "@/lib/api/client";
import { z } from "zod";

export const roleSchema = z.object({
  role_id: z.string().uuid(),
  role_name: z.string(),
  role_code: z.string().optional().catch(""),
  description: z.string().optional().catch(""),
  is_active: z.boolean().optional().catch(true),
});
export type RoleEntity = z.infer<typeof roleSchema>;

export const rolesListResponseSchema = z.union([
  z.object({
    data: z.array(roleSchema),
  }),
  z.array(roleSchema).transform(data => ({ data })),
]);

export type RolesListResponse = z.infer<typeof rolesListResponseSchema>;

export async function getRoles() {
  return apiGet<RolesListResponse>("/roles", {
    schema: rolesListResponseSchema,
  });
}
