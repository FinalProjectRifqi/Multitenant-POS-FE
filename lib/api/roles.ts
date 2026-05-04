"use server";

import { apiGet } from "@/lib/api/client";
import {
  type RolesListResponse,
  rolesListResponseSchema,
} from "@/lib/schemas/role";

export async function getRoles() {
  return apiGet<RolesListResponse>("/roles", {
    schema: rolesListResponseSchema,
  });
}
