/**
 * Inventaris Service — Single integration point for inventory data.
 *
 * ───────────────────────────────────────────────────────────────────
 * TO SWITCH FROM DUMMY → REAL API:
 *
 *   1. Set `NEXT_PUBLIC_INVENTARIS_MODE=real` in .env.local
 *   2. Implement `getInventarisItemsWithApi()` to call your backend.
 *      If the response shape changes, update `inventarisListResponseSchema`.
 * ───────────────────────────────────────────────────────────────────
 */

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { CrudDeleteInput, CrudUpdateInput } from "@/lib/api/crud-types";
import {
  inventarisItemSchema,
  inventarisListResponseSchema,
  type InventarisItem,
  type InventarisItemFormValues,
} from "@/lib/schemas/inventaris";

// ─── Input types ─────────────────────────────────────────────────────────────

export type CreateInventarisInput = InventarisItemFormValues & {
  unit_id: string;
};
export type UpdateInventarisInput = CrudUpdateInput<
  InventarisItemFormValues,
  "inventaris_id"
>;
export type DeleteInventarisInput = CrudDeleteInput<"inventaris_id">;

// ─── Constants ────────────────────────────────────────────────────────────────

const INVENTARIS_ENDPOINT = "/api/inventaris";
const INVENTARIS_STORAGE_KEY = "dummy_inventaris_items";
const DUMMY_NETWORK_DELAY_IN_MS = 400;

// Unit IDs must match DUMMY_UNITS_SEED in lib/api/units.ts
const UNIT_SUDIRMAN_ID = "d5d0cf7a-5c43-4bb0-beb2-31bca863f431";
const UNIT_KUNINGAN_ID = "8766905d-faf0-41b9-929a-817c30ebf499";
const UNIT_BANDUNG_ID = "f60e6f75-e4b1-4cb9-b72f-6578f58cf6c4";
const UNIT_SURABAYA_ID = "f5d95e22-bbfe-48bf-991e-f3f3a46c2d3f";

// ─── Dummy data seed ───────────────────────────────────────────────────────────

const DUMMY_INVENTARIS_SEED: InventarisItem[] = [
  // ─ Sudirman ─
  {
    inventaris_id: "a1b2c3d4-0001-0001-0001-000000000001",
    unit_id: UNIT_SUDIRMAN_ID,
    item_name: "Beras",
    unit_of_measurement: "Liter",
    current_stock: 60,
    max_stock: 100,
    min_stock: 20,
    description: "Beras pulen untuk nasi restoran.",
    created_at: "2026-04-01T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0001-0001-0001-000000000002",
    unit_id: UNIT_SUDIRMAN_ID,
    item_name: "Minyak Goreng",
    unit_of_measurement: "Liter",
    current_stock: 15,
    max_stock: 50,
    min_stock: 10,
    description: "Minyak goreng untuk memasak.",
    created_at: "2026-04-01T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0001-0001-0001-000000000003",
    unit_id: UNIT_SUDIRMAN_ID,
    item_name: "Gula Pasir",
    unit_of_measurement: "Kg",
    current_stock: 8,
    max_stock: 30,
    min_stock: 10,
    description: "Gula pasir putih halus.",
    created_at: "2026-04-01T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0001-0001-0001-000000000004",
    unit_id: UNIT_SUDIRMAN_ID,
    item_name: "Tepung Terigu",
    unit_of_measurement: "Kg",
    current_stock: 25,
    max_stock: 40,
    min_stock: 10,
    description: "Tepung serbaguna.",
    created_at: "2026-04-01T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0001-0001-0001-000000000005",
    unit_id: UNIT_SUDIRMAN_ID,
    item_name: "Kecap Manis",
    unit_of_measurement: "Botol",
    current_stock: 4,
    max_stock: 20,
    min_stock: 5,
    description: "Kecap manis untuk marinasi.",
    created_at: "2026-04-01T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  // ─ Kuningan ─
  {
    inventaris_id: "a1b2c3d4-0002-0002-0002-000000000001",
    unit_id: UNIT_KUNINGAN_ID,
    item_name: "Beras Basmati",
    unit_of_measurement: "Kg",
    current_stock: 45,
    max_stock: 80,
    min_stock: 15,
    description: "Beras basmati premium.",
    created_at: "2026-04-02T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0002-0002-0002-000000000002",
    unit_id: UNIT_KUNINGAN_ID,
    item_name: "Santan Kelapa",
    unit_of_measurement: "Liter",
    current_stock: 6,
    max_stock: 30,
    min_stock: 10,
    description: "Santan segar untuk masak.",
    created_at: "2026-04-02T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0002-0002-0002-000000000003",
    unit_id: UNIT_KUNINGAN_ID,
    item_name: "Cabai Merah",
    unit_of_measurement: "Kg",
    current_stock: 3,
    max_stock: 15,
    min_stock: 5,
    description: "Cabai merah keriting.",
    created_at: "2026-04-02T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  // ─ Bandung ─
  {
    inventaris_id: "a1b2c3d4-0003-0003-0003-000000000001",
    unit_id: UNIT_BANDUNG_ID,
    item_name: "Susu UHT",
    unit_of_measurement: "Liter",
    current_stock: 22,
    max_stock: 50,
    min_stock: 10,
    description: "Susu full cream UHT.",
    created_at: "2026-04-03T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0003-0003-0003-000000000002",
    unit_id: UNIT_BANDUNG_ID,
    item_name: "Keju Cheddar",
    unit_of_measurement: "Gram",
    current_stock: 500,
    max_stock: 2000,
    min_stock: 500,
    description: "Keju cheddar untuk topping.",
    created_at: "2026-04-03T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  // ─ Surabaya ─
  {
    inventaris_id: "a1b2c3d4-0004-0004-0004-000000000001",
    unit_id: UNIT_SURABAYA_ID,
    item_name: "Daging Sapi",
    unit_of_measurement: "Kg",
    current_stock: 12,
    max_stock: 30,
    min_stock: 5,
    description: "Daging sapi segar potong.",
    created_at: "2026-04-04T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
  {
    inventaris_id: "a1b2c3d4-0004-0004-0004-000000000002",
    unit_id: UNIT_SURABAYA_ID,
    item_name: "Bumbu Rawon",
    unit_of_measurement: "Pack",
    current_stock: 2,
    max_stock: 20,
    min_stock: 5,
    description: "Bumbu rawon siap pakai.",
    created_at: "2026-04-04T08:00:00.000Z",
    updated_at: "2026-04-22T08:00:00.000Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isDummyMode(): boolean {
  return process.env.NEXT_PUBLIC_INVENTARIS_MODE !== "real";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readItemsFromStorage(): InventarisItem[] {
  if (typeof window === "undefined") return cloneSeed();
  const raw = localStorage.getItem(INVENTARIS_STORAGE_KEY);
  if (!raw) return cloneSeed();
  try {
    return JSON.parse(raw) as InventarisItem[];
  } catch {
    return cloneSeed();
  }
}

function cloneSeed(): InventarisItem[] {
  return JSON.parse(JSON.stringify(DUMMY_INVENTARIS_SEED)) as InventarisItem[];
}

function ensureSeeded(): InventarisItem[] {
  if (typeof window === "undefined") return cloneSeed();
  if (!localStorage.getItem(INVENTARIS_STORAGE_KEY)) {
    localStorage.setItem(INVENTARIS_STORAGE_KEY, JSON.stringify(cloneSeed()));
  }
  return readItemsFromStorage();
}

// ─── API functions ────────────────────────────────────────────────────────────

async function getInventarisItemsWithDummy(): Promise<InventarisItem[]> {
  await delay(DUMMY_NETWORK_DELAY_IN_MS);
  return ensureSeeded();
}

async function getInventarisItemsWithApi(): Promise<InventarisItem[]> {
  return apiGet<InventarisItem[]>(INVENTARIS_ENDPOINT, {
    schema: inventarisListResponseSchema,
  });
}

export async function getInventarisItems(): Promise<InventarisItem[]> {
  return isDummyMode()
    ? getInventarisItemsWithDummy()
    : getInventarisItemsWithApi();
}

// ─── Create ───────────────────────────────────────────────────────────────────

async function createInventarisItemWithDummy(
  input: CreateInventarisInput,
): Promise<InventarisItem> {
  await delay(DUMMY_NETWORK_DELAY_IN_MS);
  const items = ensureSeeded();
  const now = new Date().toISOString();
  const newItem: InventarisItem = {
    inventaris_id: crypto.randomUUID(),
    unit_id: input.unit_id,
    item_name: input.item_name,
    unit_of_measurement: input.unit_of_measurement,
    current_stock: input.current_stock,
    max_stock: input.max_stock,
    min_stock: input.min_stock,
    description: input.description,
    created_at: now,
    updated_at: now,
  };
  items.push(newItem);
  if (typeof window !== "undefined") {
    localStorage.setItem(INVENTARIS_STORAGE_KEY, JSON.stringify(items));
  }
  return newItem;
}

async function createInventarisItemWithApi(
  input: CreateInventarisInput,
): Promise<InventarisItem> {
  return apiPost<InventarisItem>(INVENTARIS_ENDPOINT, input, {
    schema: inventarisItemSchema,
  });
}

export async function createInventarisItem(
  input: CreateInventarisInput,
): Promise<InventarisItem> {
  return isDummyMode()
    ? createInventarisItemWithDummy(input)
    : createInventarisItemWithApi(input);
}

// ─── Update ───────────────────────────────────────────────────────────────────

async function updateInventarisItemWithDummy(
  input: UpdateInventarisInput,
): Promise<InventarisItem> {
  await delay(DUMMY_NETWORK_DELAY_IN_MS);
  const items = ensureSeeded();
  const idx = items.findIndex(
    (item) => item.inventaris_id === input.inventaris_id,
  );
  if (idx === -1) throw new Error("Item tidak ditemukan");
  const updated: InventarisItem = {
    ...items[idx],
    ...input.payload,
    updated_at: new Date().toISOString(),
  };
  items[idx] = updated;
  if (typeof window !== "undefined") {
    localStorage.setItem(INVENTARIS_STORAGE_KEY, JSON.stringify(items));
  }
  return updated;
}

async function updateInventarisItemWithApi(
  input: UpdateInventarisInput,
): Promise<InventarisItem> {
  return apiPatch<InventarisItem>(
    `${INVENTARIS_ENDPOINT}/${input.inventaris_id}`,
    input.payload,
    { schema: inventarisItemSchema },
  );
}

export async function updateInventarisItem(
  input: UpdateInventarisInput,
): Promise<InventarisItem> {
  return isDummyMode()
    ? updateInventarisItemWithDummy(input)
    : updateInventarisItemWithApi(input);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

async function deleteInventarisItemWithDummy(
  input: DeleteInventarisInput,
): Promise<void> {
  await delay(DUMMY_NETWORK_DELAY_IN_MS);
  const items = ensureSeeded().filter(
    (item) => item.inventaris_id !== input.inventaris_id,
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(INVENTARIS_STORAGE_KEY, JSON.stringify(items));
  }
}

async function deleteInventarisItemWithApi(
  input: DeleteInventarisInput,
): Promise<void> {
  await apiDelete(`${INVENTARIS_ENDPOINT}/${input.inventaris_id}`);
}

export async function deleteInventarisItem(
  input: DeleteInventarisInput,
): Promise<void> {
  return isDummyMode()
    ? deleteInventarisItemWithDummy(input)
    : deleteInventarisItemWithApi(input);
}
