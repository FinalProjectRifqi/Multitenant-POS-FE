import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { CrudDeleteInput, CrudUpdateInput } from "@/lib/api/crud-types";
import {
  createMenuItemRequestSchema,
  createMenuItemResponseSchema,
  type CreateMenuItemRequest,
  type DeleteMenuItemRequest,
  deleteMenuItemRequestSchema,
  menuCategoriesListResponseSchema,
  type MenuCategoryEntity,
  menuCategoryIdSchema,
  menuItemIdSchema,
  menuItemsListResponseSchema,
  type MenuItemEntity,
  updateMenuItemRequestSchema,
  updateMenuItemResponseSchema,
  type UpdateMenuItemRequest,
} from "@/lib/schemas/menu";

const MENU_CATEGORY_STORAGE_KEY = "menu_categories_storage";
const MENU_ITEM_STORAGE_KEY = "menu_items_storage";
const DUMMY_NETWORK_DELAY_IN_MS = 350;
const MENU_CATEGORIES_ENDPOINT = "/menu-categories";
const MENU_ITEMS_ENDPOINT = "/menu-items";

// Keep in sync with dummy unit IDs in lib/api/units.ts
const UNIT_SUDIRMAN_ID = "d5d0cf7a-5c43-4bb0-beb2-31bca863f431";
const UNIT_KUNINGAN_ID = "8766905d-faf0-41b9-929a-817c30ebf499";
const UNIT_BANDUNG_ID = "f60e6f75-e4b1-4cb9-b72f-6578f58cf6c4";
const UNIT_SURABAYA_ID = "f5d95e22-bbfe-48bf-991e-f3f3a46c2d3f";

export type UpdateMenuItemInput = CrudUpdateInput<
  UpdateMenuItemRequest,
  "menu_item_id"
>;

export type DeleteMenuItemInput = CrudDeleteInput<"menu_item_id">;

const DUMMY_MENU_CATEGORIES_SEED: MenuCategoryEntity[] = [
  {
    menu_category_id: "a8eb8d86-2f7b-4b3f-85b2-830f3ab6458f",
    unit_id: UNIT_SUDIRMAN_ID,
    category_name: "Makanan Utama",
    description: "Menu makanan utama untuk makan siang dan malam",
    is_active: true,
    created_at: "2026-04-20T08:00:00.000Z",
    updated_at: "2026-04-20T08:00:00.000Z",
  },
  {
    menu_category_id: "b9369f52-e577-49fd-8cf3-c87d1a2c8599",
    unit_id: UNIT_SUDIRMAN_ID,
    category_name: "Minuman",
    description: "Pilihan minuman panas dan dingin",
    is_active: true,
    created_at: "2026-04-20T08:10:00.000Z",
    updated_at: "2026-04-20T08:10:00.000Z",
  },
  {
    menu_category_id: "ee6d5fd8-80b2-4978-a5e1-f8af0f7c8b7f",
    unit_id: UNIT_KUNINGAN_ID,
    category_name: "Makanan Utama",
    description: "Menu andalan cabang Kuningan",
    is_active: true,
    created_at: "2026-04-20T08:00:00.000Z",
    updated_at: "2026-04-20T08:00:00.000Z",
  },
  {
    menu_category_id: "739ad8ab-42f7-4cdb-a50b-bfc3ec97c84c",
    unit_id: UNIT_BANDUNG_ID,
    category_name: "Snack",
    description: "Camilan ringan untuk teman kopi",
    is_active: true,
    created_at: "2026-04-20T09:00:00.000Z",
    updated_at: "2026-04-20T09:00:00.000Z",
  },
  {
    menu_category_id: "f2d8f4c0-8d33-4ee3-a7f9-30f2ec778f9f",
    unit_id: UNIT_SURABAYA_ID,
    category_name: "Minuman",
    description: "Menu minuman khas Surabaya",
    is_active: true,
    created_at: "2026-04-20T09:10:00.000Z",
    updated_at: "2026-04-20T09:10:00.000Z",
  },
];

const DUMMY_MENU_ITEMS_SEED: MenuItemEntity[] = [
  {
    menu_item_id: "38199672-b364-48ba-adf4-5c13da0b8f39",
    menu_category_id: "a8eb8d86-2f7b-4b3f-85b2-830f3ab6458f",
    menu_item_name: "Nasi Goreng Spesial",
    image_url: "",
    item_price: 35000,
    is_available: true,
    created_at: "2026-04-20T10:00:00.000Z",
    updated_at: "2026-04-20T10:00:00.000Z",
  },
  {
    menu_item_id: "07490608-f24f-47db-a074-0b91d857ab03",
    menu_category_id: "a8eb8d86-2f7b-4b3f-85b2-830f3ab6458f",
    menu_item_name: "Ayam Bakar Madu",
    image_url: "",
    item_price: 42000,
    is_available: true,
    created_at: "2026-04-20T10:10:00.000Z",
    updated_at: "2026-04-20T10:10:00.000Z",
  },
  {
    menu_item_id: "7538db58-034f-422d-b79b-8ef3ccac5cb6",
    menu_category_id: "b9369f52-e577-49fd-8cf3-c87d1a2c8599",
    menu_item_name: "Es Teh Manis",
    image_url: "",
    item_price: 9000,
    is_available: true,
    created_at: "2026-04-20T10:20:00.000Z",
    updated_at: "2026-04-20T10:20:00.000Z",
  },
  {
    menu_item_id: "f8bc34c8-f9e6-4896-9e10-f8a507f0382f",
    menu_category_id: "ee6d5fd8-80b2-4978-a5e1-f8af0f7c8b7f",
    menu_item_name: "Sate Ayam",
    image_url: "",
    item_price: 38000,
    is_available: true,
    created_at: "2026-04-20T10:30:00.000Z",
    updated_at: "2026-04-20T10:30:00.000Z",
  },
  {
    menu_item_id: "155532d7-44ff-4a68-9df8-f9dbf13e3f92",
    menu_category_id: "739ad8ab-42f7-4cdb-a50b-bfc3ec97c84c",
    menu_item_name: "Kentang Goreng",
    image_url: "",
    item_price: 22000,
    is_available: false,
    created_at: "2026-04-20T10:40:00.000Z",
    updated_at: "2026-04-20T10:40:00.000Z",
  },
  {
    menu_item_id: "22ae2f53-76ac-478e-adf8-28a95de9e4e7",
    menu_category_id: "f2d8f4c0-8d33-4ee3-a7f9-30f2ec778f9f",
    menu_item_name: "Es Kopi Susu",
    image_url: "",
    item_price: 28000,
    is_available: true,
    created_at: "2026-04-20T10:50:00.000Z",
    updated_at: "2026-04-20T10:50:00.000Z",
  },
];

function cloneSeedCategories(): MenuCategoryEntity[] {
  return DUMMY_MENU_CATEGORIES_SEED.map((category) => ({ ...category }));
}

function cloneSeedMenuItems(): MenuItemEntity[] {
  return DUMMY_MENU_ITEMS_SEED.map((item) => ({ ...item }));
}

function delay(ms = DUMMY_NETWORK_DELAY_IN_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDummyMode(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_MODE !== "real";
}

function assertValidMenuItemId(menuItemId: string): string {
  return menuItemIdSchema.parse(menuItemId);
}

function assertValidMenuCategoryId(menuCategoryId: string): string {
  return menuCategoryIdSchema.parse(menuCategoryId);
}

function ensureMenuStorageSeeded(): void {
  if (typeof window === "undefined") {
    return;
  }

  const rawCategories = localStorage.getItem(MENU_CATEGORY_STORAGE_KEY);
  if (!rawCategories) {
    localStorage.setItem(
      MENU_CATEGORY_STORAGE_KEY,
      JSON.stringify(cloneSeedCategories()),
    );
  }

  const rawMenuItems = localStorage.getItem(MENU_ITEM_STORAGE_KEY);
  if (!rawMenuItems) {
    localStorage.setItem(
      MENU_ITEM_STORAGE_KEY,
      JSON.stringify(cloneSeedMenuItems()),
    );
  }
}

function readMenuCategoriesFromStorage(): MenuCategoryEntity[] {
  if (typeof window === "undefined") {
    return cloneSeedCategories();
  }

  ensureMenuStorageSeeded();
  const raw = localStorage.getItem(MENU_CATEGORY_STORAGE_KEY);

  if (!raw) {
    return cloneSeedCategories();
  }

  try {
    const parsed = menuCategoriesListResponseSchema.parse(JSON.parse(raw));
    return parsed.map((category) => ({ ...category }));
  } catch {
    const fallback = cloneSeedCategories();
    localStorage.setItem(MENU_CATEGORY_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function readMenuItemsFromStorage(): MenuItemEntity[] {
  if (typeof window === "undefined") {
    return cloneSeedMenuItems();
  }

  ensureMenuStorageSeeded();
  const raw = localStorage.getItem(MENU_ITEM_STORAGE_KEY);

  if (!raw) {
    return cloneSeedMenuItems();
  }

  try {
    const parsed = menuItemsListResponseSchema.parse(JSON.parse(raw));
    return parsed.map((item) => ({ ...item }));
  } catch {
    const fallback = cloneSeedMenuItems();
    localStorage.setItem(MENU_ITEM_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function writeMenuItemsToStorage(items: MenuItemEntity[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(MENU_ITEM_STORAGE_KEY, JSON.stringify(items));
}

function normalizeWritePayload(
  payload: CreateMenuItemRequest | UpdateMenuItemRequest,
): CreateMenuItemRequest {
  const parsed = createMenuItemRequestSchema.parse(payload);

  return {
    menu_category_id: parsed.menu_category_id,
    menu_item_name: parsed.menu_item_name.trim(),
    image_url: parsed.image_url?.trim() ?? "",
    item_price: parsed.item_price,
    is_available: parsed.is_available,
  };
}

function ensureCategoryExists(categoryId: string): void {
  const categories = readMenuCategoriesFromStorage();
  const found = categories.find((item) => item.menu_category_id === categoryId);

  if (!found || !found.is_active) {
    throw new Error("Kategori menu tidak ditemukan atau tidak aktif.");
  }
}

async function getMenuCategoriesWithDummy(): Promise<MenuCategoryEntity[]> {
  await delay();
  return readMenuCategoriesFromStorage();
}

async function getMenuItemsWithDummy(): Promise<MenuItemEntity[]> {
  await delay();
  return readMenuItemsFromStorage();
}

async function createMenuItemWithDummy(
  payload: CreateMenuItemRequest,
): Promise<MenuItemEntity> {
  await delay();

  const normalized = normalizeWritePayload(payload);
  const categoryId = assertValidMenuCategoryId(normalized.menu_category_id);
  ensureCategoryExists(categoryId);

  const now = new Date().toISOString();

  const nextItem: MenuItemEntity = {
    menu_item_id: crypto.randomUUID(),
    menu_category_id: categoryId,
    menu_item_name: normalized.menu_item_name,
    image_url: normalized.image_url ?? "",
    item_price: normalized.item_price,
    is_available: normalized.is_available,
    created_at: now,
    updated_at: now,
  };

  const currentItems = readMenuItemsFromStorage();
  writeMenuItemsToStorage([nextItem, ...currentItems]);

  return nextItem;
}

async function updateMenuItemWithDummy(
  input: UpdateMenuItemInput,
): Promise<MenuItemEntity> {
  await delay();

  const menuItemId = assertValidMenuItemId(input.menu_item_id);
  const normalized = normalizeWritePayload(input.payload);
  const categoryId = assertValidMenuCategoryId(normalized.menu_category_id);
  ensureCategoryExists(categoryId);

  const menuItems = readMenuItemsFromStorage();
  const targetIndex = menuItems.findIndex(
    (item) => item.menu_item_id === menuItemId,
  );

  if (targetIndex < 0) {
    throw new Error("Menu tidak ditemukan.");
  }

  const current = menuItems[targetIndex];
  const now = new Date().toISOString();

  const updatedItem: MenuItemEntity = {
    ...current,
    menu_category_id: categoryId,
    menu_item_name: normalized.menu_item_name,
    image_url: normalized.image_url ?? "",
    item_price: normalized.item_price,
    is_available: normalized.is_available,
    updated_at: now,
  };

  const nextItems = [...menuItems];
  nextItems[targetIndex] = updatedItem;
  writeMenuItemsToStorage(nextItems);

  return updatedItem;
}

async function deleteMenuItemWithDummy(
  input: DeleteMenuItemInput,
): Promise<void> {
  await delay();

  const payload: DeleteMenuItemRequest =
    deleteMenuItemRequestSchema.parse(input);
  const menuItems = readMenuItemsFromStorage();
  const nextItems = menuItems.filter(
    (item) => item.menu_item_id !== payload.menu_item_id,
  );

  if (nextItems.length === menuItems.length) {
    throw new Error("Menu tidak ditemukan.");
  }

  writeMenuItemsToStorage(nextItems);
}

async function getMenuCategoriesWithApi(): Promise<MenuCategoryEntity[]> {
  return apiGet<MenuCategoryEntity[]>(MENU_CATEGORIES_ENDPOINT, {
    schema: menuCategoriesListResponseSchema,
  });
}

async function getMenuItemsWithApi(): Promise<MenuItemEntity[]> {
  return apiGet<MenuItemEntity[]>(MENU_ITEMS_ENDPOINT, {
    schema: menuItemsListResponseSchema,
  });
}

async function createMenuItemWithApi(
  payload: CreateMenuItemRequest,
): Promise<MenuItemEntity> {
  const normalized = normalizeWritePayload(payload);

  return apiPost<MenuItemEntity, CreateMenuItemRequest>(
    MENU_ITEMS_ENDPOINT,
    normalized,
    {
      schema: createMenuItemResponseSchema,
    },
  );
}

async function updateMenuItemWithApi(
  input: UpdateMenuItemInput,
): Promise<MenuItemEntity> {
  const menuItemId = assertValidMenuItemId(input.menu_item_id);
  const normalized = updateMenuItemRequestSchema.parse(input.payload);

  return apiPatch<MenuItemEntity, UpdateMenuItemRequest>(
    `${MENU_ITEMS_ENDPOINT}/${menuItemId}`,
    normalized,
    {
      schema: updateMenuItemResponseSchema,
    },
  );
}

async function deleteMenuItemWithApi(
  input: DeleteMenuItemInput,
): Promise<void> {
  const payload: DeleteMenuItemRequest =
    deleteMenuItemRequestSchema.parse(input);

  await apiDelete<void>(`${MENU_ITEMS_ENDPOINT}/${payload.menu_item_id}`);
}

export async function getMenuCategories(): Promise<MenuCategoryEntity[]> {
  return isDummyMode()
    ? getMenuCategoriesWithDummy()
    : getMenuCategoriesWithApi();
}

export async function getMenuItems(): Promise<MenuItemEntity[]> {
  return isDummyMode() ? getMenuItemsWithDummy() : getMenuItemsWithApi();
}

export async function createMenuItem(
  payload: CreateMenuItemRequest,
): Promise<MenuItemEntity> {
  return isDummyMode()
    ? createMenuItemWithDummy(payload)
    : createMenuItemWithApi(payload);
}

export async function updateMenuItem(
  input: UpdateMenuItemInput,
): Promise<MenuItemEntity> {
  return isDummyMode()
    ? updateMenuItemWithDummy(input)
    : updateMenuItemWithApi(input);
}

export async function deleteMenuItem(
  input: DeleteMenuItemInput,
): Promise<void> {
  return isDummyMode()
    ? deleteMenuItemWithDummy(input)
    : deleteMenuItemWithApi(input);
}
