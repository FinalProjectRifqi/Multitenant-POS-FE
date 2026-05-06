"use client";

// components/orders/menu-grid.tsx

import { ImageOff, Minus, Plus } from "lucide-react";
import Image from "next/image";

import type { CartItem } from "@/lib/orders/types";
import type { MenuEntity } from "@/lib/schemas/menu";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Menu Card ────────────────────────────────────────────────────────────────

function MenuCard({
  menu,
  cartQty,
  onAdd,
  onUpdateQty,
}: {
  menu: MenuEntity;
  cartQty: number;
  onAdd: (menu: MenuEntity) => void;
  onUpdateQty: (menuItemId: string, delta: number) => void;
}) {
  const unavailable = !menu.is_available;

  return (
    <div
      className={cn(
        "relative w-56.25 h-75 rounded-2xl overflow-hidden select-none",
        unavailable && "opacity-60",
      )}
    >
      {/* Background / image */}
      {menu.menu_image ? (
        <Image
          src={menu.menu_image}
          alt={menu.menu_name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted to-muted/70 flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-muted-foreground/50" />
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Qty badge — top right */}
      {cartQty > 0 && (
        <div className="absolute top-2 right-2 min-w-[1.5rem] h-6 bg-primary rounded-full flex items-center justify-center px-1.5 shadow-sm">
          <span className="text-[11px] text-primary-foreground font-bold leading-none">
            {cartQty}
          </span>
        </div>
      )}

      {/* Name + price + controls — bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between gap-2">
        {/* Text info */}
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm leading-tight line-clamp-1 drop-shadow-sm">
            {menu.menu_name}
          </p>
          <p className="text-white/80 text-xs mt-0.5 drop-shadow-sm">
            {formatRupiah(menu.menu_price)}
          </p>
        </div>

        {/* Add / quantity controls */}
        {!unavailable && (
          <>
            {cartQty === 0 ? (
              <button
                type="button"
                onClick={() => onAdd(menu)}
                className="shrink-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary transition-colors group"
                aria-label={`Tambah ${menu.menu_name}`}
              >
                <Plus className="w-3.5 h-3.5 text-gray-800 group-hover:text-white transition-colors" />
              </button>
            ) : (
              <div className="shrink-0 flex items-center gap-0.5 bg-white rounded-full shadow-md px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => onUpdateQty(menu.menu_id, -1)}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Kurang"
                >
                  <Minus className="w-3 h-3 text-gray-800" />
                </button>
                <span className="text-[11px] font-bold text-gray-900 w-4 text-center leading-none">
                  {cartQty}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(menu.menu_id, 1)}
                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Tambah"
                >
                  <Plus className="w-3 h-3 text-gray-800" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Unavailable overlay */}
      {unavailable && (
        <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
          <span className="text-xs font-medium bg-background/80 text-foreground px-3 py-1 rounded-full shadow-sm">
            Tidak tersedia
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Menu Grid ────────────────────────────────────────────────────────────────

interface MenuGridProps {
  menus: MenuEntity[];
  cart: CartItem[];
  onAdd: (menu: MenuEntity) => void;
  onUpdateQty: (menuItemId: string, delta: number) => void;
}

export function MenuGrid({ menus, cart, onAdd, onUpdateQty }: MenuGridProps) {
  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ImageOff className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Tidak ada menu yang cocok</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {menus.map((menu) => {
        const cartQty =
          cart.find((c) => c.menu_item_id === menu.menu_id)?.quantity ?? 0;
        return (
          <MenuCard
            key={menu.menu_id}
            menu={menu}
            cartQty={cartQty}
            onAdd={onAdd}
            onUpdateQty={onUpdateQty}
          />
        );
      })}
    </div>
  );
}
