/**
 * lib/api/orders.ts
 *
 * Order service layer for the Kitchen Display System.
 * Follows the same dual-mode pattern as units.ts / menu.ts:
 *   - NEXT_PUBLIC_AUTH_MODE !== "real" → dummy localStorage implementation
 *   - NEXT_PUBLIC_AUTH_MODE === "real"  → real backend REST calls
 */

import { apiGet, apiPatch } from "@/lib/api/client";
import {
  kdsStatusSchema,
  orderIdSchema,
  ordersListResponseSchema,
  type KdsStatus,
  type OrderEntity,
  type UpdateOrderStatusInput,
} from "@/lib/schemas/order";

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDERS_STORAGE_KEY = "kds_orders_storage";
const DUMMY_DELAY_MS = 350;
const ORDERS_ENDPOINT = "/orders";

// ── Dummy seed data ───────────────────────────────────────────────────────────

const DUMMY_ORDERS_SEED: OrderEntity[] = [
  {
    order_id: "11111111-0000-0000-0000-000000000001",
    order_number: "ORD-001",
    table_number: "Meja 3",
    customer_name: "Nizam",
    kds_status: "menunggu",
    order_type: "Dine In",
    notes: null,
    ordered_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    items: [
      {
        order_item_id: "aa111111-0000-0000-0000-000000000001",
        menu_item_id: "bb111111-0000-0000-0000-000000000001",
        menu_item_name: "Nasi Goreng Spesial",
        quantity: 1,
        item_price: 35000,
        notes: "Tidak Pedas",
      },
      {
        order_item_id: "aa111111-0000-0000-0000-000000000002",
        menu_item_id: "bb111111-0000-0000-0000-000000000002",
        menu_item_name: "Es Teh Manis",
        quantity: 1,
        item_price: 8000,
        notes: "Less Sugar",
      },
    ],
    subtotal: 43000,
    tax_amount: 4300,
    total_amount: 47300,
  },
  {
    order_id: "11111111-0000-0000-0000-000000000002",
    order_number: "ORD-002",
    table_number: "Meja 7",
    customer_name: "Ahmad",
    kds_status: "diproses",
    order_type: "Dine In",
    notes: null,
    ordered_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    items: [
      {
        order_item_id: "aa222222-0000-0000-0000-000000000001",
        menu_item_id: "bb222222-0000-0000-0000-000000000001",
        menu_item_name: "Nasi Goreng Bebek",
        quantity: 1,
        item_price: 45000,
        notes: "Tidak Pedas",
      },
      {
        order_item_id: "aa222222-0000-0000-0000-000000000002",
        menu_item_id: "bb222222-0000-0000-0000-000000000002",
        menu_item_name: "Es Cendol",
        quantity: 1,
        item_price: 12000,
        notes: "Less Sugar",
      },
    ],
    subtotal: 57000,
    tax_amount: 5700,
    total_amount: 62700,
  },
  {
    order_id: "11111111-0000-0000-0000-000000000003",
    order_number: "ORD-003",
    table_number: "Meja 1",
    customer_name: "Muzamil",
    kds_status: "siap_disajikan",
    order_type: "Dine In",
    notes: null,
    ordered_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    items: [
      {
        order_item_id: "aa333333-0000-0000-0000-000000000001",
        menu_item_id: "bb333333-0000-0000-0000-000000000001",
        menu_item_name: "Nasi Liwet Ayam Goreng",
        quantity: 1,
        item_price: 40000,
        notes: "Tambah Timun",
      },
      {
        order_item_id: "aa333333-0000-0000-0000-000000000002",
        menu_item_id: "bb333333-0000-0000-0000-000000000002",
        menu_item_name: "Es Jeruk",
        quantity: 1,
        item_price: 10000,
        notes: null,
      },
    ],
    subtotal: 50000,
    tax_amount: 5000,
    total_amount: 55000,
  },
  {
    order_id: "11111111-0000-0000-0000-000000000004",
    order_number: "ORD-004",
    table_number: "Take Away",
    customer_name: "Budi",
    kds_status: "menunggu",
    order_type: "Take Away",
    notes: "Bungkus rapat",
    ordered_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    items: [
      {
        order_item_id: "aa444444-0000-0000-0000-000000000001",
        menu_item_id: "bb444444-0000-0000-0000-000000000001",
        menu_item_name: "Mie Goreng Spesial",
        quantity: 2,
        item_price: 30000,
        notes: "Extra Pedas",
      },
      {
        order_item_id: "aa444444-0000-0000-0000-000000000002",
        menu_item_id: "bb444444-0000-0000-0000-000000000002",
        menu_item_name: "Air Mineral",
        quantity: 2,
        item_price: 5000,
        notes: null,
      },
    ],
    subtotal: 70000,
    tax_amount: 7000,
    total_amount: 77000,
  },
  {
    order_id: "11111111-0000-0000-0000-000000000005",
    order_number: "ORD-005",
    table_number: "Meja 5",
    customer_name: "Siti",
    kds_status: "diproses",
    order_type: "Dine In",
    notes: null,
    ordered_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    items: [
      {
        order_item_id: "aa555555-0000-0000-0000-000000000001",
        menu_item_id: "bb555555-0000-0000-0000-000000000001",
        menu_item_name: "Ayam Bakar Madu",
        quantity: 1,
        item_price: 38000,
        notes: null,
      },
      {
        order_item_id: "aa555555-0000-0000-0000-000000000002",
        menu_item_id: "bb555555-0000-0000-0000-000000000002",
        menu_item_name: "Sup Tomat",
        quantity: 1,
        item_price: 18000,
        notes: null,
      },
      {
        order_item_id: "aa555555-0000-0000-0000-000000000003",
        menu_item_id: "bb555555-0000-0000-0000-000000000003",
        menu_item_name: "Jus Alpukat",
        quantity: 1,
        item_price: 15000,
        notes: "Tanpa Susu",
      },
    ],
    subtotal: 71000,
    tax_amount: 7100,
    total_amount: 78100,
  },
  {
    order_id: "11111111-0000-0000-0000-000000000006",
    order_number: "ORD-006",
    table_number: "Meja 9",
    customer_name: "Reza",
    kds_status: "siap_disajikan",
    order_type: "Dine In",
    notes: null,
    ordered_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    items: [
      {
        order_item_id: "aa666666-0000-0000-0000-000000000001",
        menu_item_id: "bb666666-0000-0000-0000-000000000001",
        menu_item_name: "Sate Kambing",
        quantity: 2,
        item_price: 25000,
        notes: "Porsi Extra",
      },
      {
        order_item_id: "aa666666-0000-0000-0000-000000000002",
        menu_item_id: "bb666666-0000-0000-0000-000000000002",
        menu_item_name: "Nasi Putih",
        quantity: 2,
        item_price: 5000,
        notes: null,
      },
    ],
    subtotal: 60000,
    tax_amount: 6000,
    total_amount: 66000,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isDummyMode(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_MODE !== "real";
}

function delay(ms = DUMMY_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneSeed(): OrderEntity[] {
  return DUMMY_ORDERS_SEED.map((o) => ({
    ...o,
    items: o.items.map((i) => ({ ...i })),
  }));
}

function ensureStorageSeeded(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(ORDERS_STORAGE_KEY)) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cloneSeed()));
  }
}

function readOrdersFromStorage(): OrderEntity[] {
  if (typeof window === "undefined") return cloneSeed();
  ensureStorageSeeded();
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return cloneSeed();
  try {
    return ordersListResponseSchema.parse(JSON.parse(raw));
  } catch {
    const fallback = cloneSeed();
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function writeOrdersToStorage(orders: OrderEntity[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

// ── Dummy implementations ─────────────────────────────────────────────────────

async function getOrdersWithDummy(): Promise<OrderEntity[]> {
  await delay();
  return readOrdersFromStorage();
}

async function updateOrderStatusWithDummy(
  input: UpdateOrderStatusInput,
): Promise<OrderEntity> {
  await delay();

  const orderId = orderIdSchema.parse(input.order_id);
  const newStatus = kdsStatusSchema.parse(input.payload.kds_status);
  const orders = readOrdersFromStorage();
  const idx = orders.findIndex((o) => o.order_id === orderId);

  if (idx < 0) {
    throw new Error("Pesanan tidak ditemukan.");
  }

  const updated: OrderEntity = { ...orders[idx], kds_status: newStatus };
  const next = [...orders];
  next[idx] = updated;
  writeOrdersToStorage(next);
  return updated;
}

// ── Real API implementations ──────────────────────────────────────────────────

async function getOrdersWithApi(): Promise<OrderEntity[]> {
  return apiGet<OrderEntity[]>(ORDERS_ENDPOINT, {
    schema: ordersListResponseSchema,
  });
}

async function updateOrderStatusWithApi(
  input: UpdateOrderStatusInput,
): Promise<OrderEntity> {
  const orderId = orderIdSchema.parse(input.order_id);
  return apiPatch<OrderEntity, { kds_status: KdsStatus }>(
    `${ORDERS_ENDPOINT}/${orderId}`,
    { kds_status: input.payload.kds_status },
  );
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Fetch all active KDS orders for the current unit.
 * Backend should scope by the authenticated user's unit_id automatically.
 */
export async function getOrders(): Promise<OrderEntity[]> {
  return isDummyMode() ? getOrdersWithDummy() : getOrdersWithApi();
}

/**
 * Advance the KDS status of a single order.
 * Only forward transitions are allowed (enforced by the UI / domain logic).
 */
export async function updateOrderStatus(
  input: UpdateOrderStatusInput,
): Promise<OrderEntity> {
  return isDummyMode()
    ? updateOrderStatusWithDummy(input)
    : updateOrderStatusWithApi(input);
}
