"use client";

// lib/orders/use-order-form-page.ts — Hook for add/edit order pages.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { TAX_RATE } from "@/lib/orders/constants";
import type { CartItem, OrderDetail } from "@/lib/orders/types";
import { useMenusQuery } from "@/lib/queries/menu";
import { useOrderTypesQuery } from "@/lib/queries/order-types";
import {
  useCreatePosOrderMutation,
  usePosOrderDetailQuery,
  useUpdatePosOrderMutation,
} from "@/lib/queries/pos-orders";
import type { MenuEntity } from "@/lib/schemas/menu";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type OrderFormMode = "create" | "edit";

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useOrderFormPage(mode: OrderFormMode, orderId?: string) {
  const router = useRouter();
  const user = useCurrentUser();
  const unitId = user?.unit?.unit_id ?? "";
  // For STAF_UNIT, businessId (for menus) = unitId
  const businessId = unitId;

  // ── Form state ──────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderTypeId, setOrderTypeId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // ── Menu filter/search state ────────────────────────────────────────────────
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [menuSearch, setMenuSearch] = useState("");

  // ── Queries ─────────────────────────────────────────────────────────────────
  const menusQuery = useMenusQuery(businessId, { limit: 100 });
  const orderTypesQuery = useOrderTypesQuery();
  const orderDetailQuery = usePosOrderDetailQuery(unitId, orderId ?? "");

  // ── Set default order type once loaded ─────────────────────────────────────
  useEffect(() => {
    if (orderTypesQuery.data?.data?.length && !orderTypeId) {
      setOrderTypeId(orderTypesQuery.data.data[0].order_type_id);
    }
  }, [orderTypesQuery.data, orderTypeId]);

  // ── Pre-fill cart on edit mode ──────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "edit" || !orderDetailQuery.data?.data) return;
    const order: OrderDetail = orderDetailQuery.data.data;
    setCart(
      order.items.map((item) => ({
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item_name,
        item_price: item.item_price,
        quantity: item.quantity,
        notes: item.notes ?? undefined,
      })),
    );
    setOrderTypeId(order.order_type_id);
    setCustomerName(order.customer_name);
    setTableNumber(order.table_number ?? "");
    setOrderNotes(order.notes ?? "");
  }, [mode, orderDetailQuery.data]);

  // ── Cart calculations ───────────────────────────────────────────────────────
  const subtotal = cart.reduce(
    (s, item) => s + item.item_price * item.quantity,
    0,
  );
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const totalAmount = subtotal + taxAmount;

  // ── Derived menu data ───────────────────────────────────────────────────────
  const allMenus: MenuEntity[] = menusQuery.data?.data ?? [];

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(allMenus.map((m) => m.menu_category_name).filter(Boolean)),
    );
    return ["Semua", ...cats];
  }, [allMenus]);

  const filteredMenus = useMemo(() => {
    let result = allMenus;
    if (categoryFilter !== "Semua") {
      result = result.filter((m) => m.menu_category_name === categoryFilter);
    }
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      result = result.filter((m) => m.menu_name.toLowerCase().includes(q));
    }
    return result;
  }, [allMenus, categoryFilter, menuSearch]);

  // ── Cart manipulation ───────────────────────────────────────────────────────
  const addToCart = useCallback((menu: MenuEntity) => {
    if (!menu.is_available) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item_id === menu.menu_id);
      if (existing) {
        return prev.map((c) =>
          c.menu_item_id === menu.menu_id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [
        ...prev,
        {
          menu_item_id: menu.menu_id,
          menu_item_name: menu.menu_name,
          item_price: menu.menu_price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateCartQty = useCallback((menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menu_item_id === menuItemId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const removeCartItem = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menu_item_id !== menuItemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createMutation = useCreatePosOrderMutation(unitId);
  const updateMutation = useUpdatePosOrderMutation(unitId, orderId ?? "");

  async function handleSubmit() {
    const payload = {
      order_type_id: orderTypeId,
      customer_name: customerName,
      ...(tableNumber ? { table_number: tableNumber } : {}),
      ...(orderNotes ? { notes: orderNotes } : {}),
      items: cart.map((c) => ({
        menu_item_id: c.menu_item_id,
        quantity: c.quantity,
        item_price: c.item_price,
        ...(c.notes ? { notes: c.notes } : {}),
      })),
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    };

    if (mode === "create") {
      await createMutation.createOrder(payload);
    } else {
      await updateMutation.updateOrder(payload);
    }
    router.push("/unit/pos");
  }

  const isDineIn = useMemo(() => {
    const selected = orderTypesQuery.data?.data?.find(
      (t) => t.order_type_id === orderTypeId,
    );
    return selected?.order_type_code?.toLowerCase().includes("dine") ?? false;
  }, [orderTypesQuery.data, orderTypeId]);

  const isMutating =
    mode === "create" ? createMutation.isPending : updateMutation.isPending;

  return {
    // state
    cart,
    orderTypeId,
    setOrderTypeId,
    customerName,
    setCustomerName,
    tableNumber,
    setTableNumber,
    orderNotes,
    setOrderNotes,
    categoryFilter,
    setCategoryFilter,
    menuSearch,
    setMenuSearch,
    // computed
    subtotal,
    taxAmount,
    totalAmount,
    categories,
    filteredMenus,
    allMenus,
    isDineIn,
    isMutating,
    // queries
    menusQuery,
    orderTypesQuery,
    orderDetailQuery,
    // actions
    addToCart,
    updateCartQty,
    removeCartItem,
    clearCart,
    handleSubmit,
  };
}
