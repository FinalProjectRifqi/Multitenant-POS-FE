/**
 * lib/api/menu.ts — Server Actions for the /v1/menus/{businessId} API.
 *
 * ⚠️  This file is marked "use server".  Import it only from other server
 *     files or from React Query hooks (which are client-side but call these
 *     via the Server Action boundary).
 */
"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { parseApiError } from "@/lib/api/parsed-api-error";
import type { CrudDeleteInput, CrudUpdateInput } from "@/lib/api/crud-types";
import {
  menuIdSchema,
  menusListResponseSchema,
  menuResponseSchema,
  type CreateMenuRequest,
  type MenuEntity,
  type MenusListResponse,
  type UpdateMenuRequest,
} from "@/lib/schemas/menu";

// ─── Endpoint builder ──────────────────────────────────────────────────────────

function menusEndpoint(businessId: string): string {
  return `/menus/${businessId}`;
}

function menuDetailEndpoint(businessId: string, menuId: string): string {
  return `/menus/${businessId}/${menuId}`;
}

// ─── Input / result types ──────────────────────────────────────────────────────

export type UpdateMenuInput = CrudUpdateInput<UpdateMenuRequest, "menu_id"> & {
  businessId: string;
};
export type DeleteMenuInput = CrudDeleteInput<"menu_id"> & {
  businessId: string;
};

export type MenuMutationResult<TData = void> =
  | { ok: true; data: TData }
  | { ok: false; status: number; message: string };

type MenuRequestBody = FormData | CreateMenuRequest | UpdateMenuRequest;

// ─── Query params ──────────────────────────────────────────────────────────────

export type GetMenusParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortType?: "ASC" | "DESC";
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function assertValidMenuId(id: string): string {
  return menuIdSchema.parse(id);
}

/**
 * Converts a plain CreateMenuRequest / UpdateMenuRequest to FormData so that
 * the API can receive it as multipart/form-data (required by the backend).
 */
function toFormData(payload: CreateMenuRequest | UpdateMenuRequest): FormData {
  const fd = new FormData();

  if ("menu_name" in payload && payload.menu_name !== undefined) {
    fd.append("menu_name", payload.menu_name);
  }
  if ("menu_category_id" in payload && payload.menu_category_id !== undefined) {
    fd.append("menu_category_id", payload.menu_category_id);
  }
  if ("item_price" in payload && payload.item_price !== undefined) {
    fd.append("item_price", String(payload.item_price));
  }
  if ("is_available" in payload && payload.is_available !== undefined) {
    fd.append("is_available", String(payload.is_available));
  }

  // Only append menu_image when the value is an actual File (binary upload).
  // String values are the existing image URL returned by the API and should
  // NOT be re-submitted — omitting menu_image on PATCH keeps the existing image.
  const img = (payload as CreateMenuRequest).menu_image;
  if (typeof File !== "undefined" && img instanceof File) {
    fd.append("menu_image", img);
  }

  return fd;
}

function hasUploadFile(payload: CreateMenuRequest | UpdateMenuRequest): boolean {
  const img = (payload as CreateMenuRequest).menu_image;
  return typeof File !== "undefined" && img instanceof File;
}

function toJsonPayload(
  payload: CreateMenuRequest | UpdateMenuRequest,
): CreateMenuRequest | UpdateMenuRequest {
  const json: UpdateMenuRequest = {};

  if ("menu_name" in payload && payload.menu_name !== undefined) {
    json.menu_name = payload.menu_name;
  }
  if ("menu_category_id" in payload && payload.menu_category_id !== undefined) {
    json.menu_category_id = payload.menu_category_id;
  }
  if ("item_price" in payload && payload.item_price !== undefined) {
    json.item_price = payload.item_price;
  }
  if ("is_available" in payload && payload.is_available !== undefined) {
    json.is_available = payload.is_available;
  }

  return json;
}

function toRequestBody(
  payload: CreateMenuRequest | UpdateMenuRequest,
): MenuRequestBody {
  return hasUploadFile(payload) ? toFormData(payload) : toJsonPayload(payload);
}

function toMenuMutationError(error: unknown): MenuMutationResult<never> {
  const parsed = parseApiError(error);
  return { ok: false, status: parsed.status, message: parsed.message };
}

// ─── Core API functions ────────────────────────────────────────────────────────

async function getMenusWithApi(
  businessId: string,
  params?: GetMenusParams,
): Promise<MenusListResponse> {
  return apiGet<MenusListResponse>(menusEndpoint(businessId), {
    schema: menusListResponseSchema,
    params,
  });
}

async function createMenuWithApi(
  businessId: string,
  payload: CreateMenuRequest,
): Promise<MenuEntity> {
  // Do not call createMenuRequestSchema.parse() here — it would strip File
  // objects from menu_image. The payload is already validated client-side.
  const body = toRequestBody(payload);

  return apiPost<MenuEntity, MenuRequestBody>(menusEndpoint(businessId), body, {
    schema: menuResponseSchema,
    // Do NOT set Content-Type manually — axios auto-sets
    // "multipart/form-data; boundary=..." when body is FormData.
  });
}

async function updateMenuWithApi(input: UpdateMenuInput): Promise<MenuEntity> {
  const menuId = assertValidMenuId(input.menu_id);
  const body = toRequestBody(input.payload);

  return apiPatch<MenuEntity, MenuRequestBody>(
    menuDetailEndpoint(input.businessId, menuId),
    body,
    {
      schema: menuResponseSchema,
      // Do NOT set Content-Type manually — axios auto-sets the boundary.
    },
  );
}

async function deleteMenuWithApi(input: DeleteMenuInput): Promise<void> {
  const menuId = assertValidMenuId(input.menu_id);
  await apiDelete<void>(menuDetailEndpoint(input.businessId, menuId));
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of menus for a business unit.
 */
export async function getMenus(
  businessId: string,
  params?: GetMenusParams,
): Promise<MenusListResponse> {
  return getMenusWithApi(businessId, params);
}

/**
 * Create a new menu item for a business unit.
 */
export async function createMenu(
  businessId: string,
  payload: CreateMenuRequest,
): Promise<MenuMutationResult<MenuEntity>> {
  try {
    return { ok: true, data: await createMenuWithApi(businessId, payload) };
  } catch (error) {
    return toMenuMutationError(error);
  }
}

/**
 * Partially update an existing menu item.
 * `input.businessId` is the business unit UUID.
 */
export async function updateMenu(
  input: UpdateMenuInput,
): Promise<MenuMutationResult<MenuEntity>> {
  try {
    return { ok: true, data: await updateMenuWithApi(input) };
  } catch (error) {
    return toMenuMutationError(error);
  }
}

/**
 * Delete (soft-delete) a menu item.
 * `input.businessId` is the business unit UUID.
 */
export async function deleteMenu(
  input: DeleteMenuInput,
): Promise<MenuMutationResult<void>> {
  try {
    await deleteMenuWithApi(input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toMenuMutationError(error);
  }
}
