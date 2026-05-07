"use client";

// components/orders/menu-grid.tsx

import { ImageOff, Minus, Plus } from "lucide-react";
import Image from "next/image";

import type { CartItem } from "@/lib/orders/types";
import type { MenuEntity } from "@/lib/schemas/menu";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Menu Card ────────────────────────────────────────────────────────────────

interface MenuCardProps {
  menu: MenuEntity;
  cartQty: number;
  onAdd: (menu: MenuEntity) => void;
  onUpdateQty: (menuItemId: string, delta: number) => void;
}

function MenuCard({ menu, cartQty, onAdd, onUpdateQty }: MenuCardProps) {
  const unavailable = !menu.is_available;

  return (
    <div
      className={cn(
        "relative w-full aspect-4/5 rounded-2xl overflow-hidden select-none group border border-border/50",
        unavailable && "opacity-60",
      )}
    >
      {/* Background Image */}
      {menu.menu_image ? (
        <Image
          src={menu.menu_image}
          alt={menu.menu_name}
          width={100}
          height={100}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageOff className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}

      {/* Gradient overlay so text is legible */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Unavailable overlay */}
      {unavailable && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]">
          <div className="bg-background px-3 py-1.5 rounded-full shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">
              Tidak tersedia
            </p>
          </div>
        </div>
      )}

      {/* Badge container (Top Right) */}
      {cartQty > 0 && !unavailable && (
        <div className="absolute top-2 right-2 flex justify-end gap-1 pointer-events-none">
          <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-primary/20">
            {cartQty}
          </div>
        </div>
      )}

      {/* Name + price + controls — bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
        {/* Text info */}
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm sm:text-base leading-tight line-clamp-2 drop-shadow-sm">
            {menu.menu_name}
          </p>
          <p className="text-white/90 text-xs sm:text-sm font-medium mt-1 drop-shadow-sm">
            {formatRupiah(menu.menu_price)}
          </p>
        </div>

        {/* Action Controls */}
        {!unavailable && (
          <div className="flex justify-end mt-auto">
            {cartQty === 0 ? (
              <Button
                type="button"
                onClick={() => onAdd(menu)}
                size="icon"
                variant="secondary"
                className="w-8 h-8 rounded-full shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-300 group/btn"
                aria-label={`Tambah ${menu.menu_name}`}
              >
                <Plus className="w-4 h-4 transition-colors" />
              </Button>
            ) : (
              <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-full shadow-md p-1 border border-border/50">
                <Button
                  type="button"
                  onClick={() => onUpdateQty(menu.menu_id, -1)}
                  size="icon"
                  variant="ghost"
                  className="w-6 h-6 rounded-full hover:bg-muted text-foreground transition-colors"
                  aria-label="Kurang"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs font-bold w-4 text-center leading-none text-foreground">
                  {cartQty}
                </span>
                <Button
                  type="button"
                  onClick={() => onUpdateQty(menu.menu_id, 1)}
                  size="icon"
                  variant="ghost"
                  className="w-6 h-6 rounded-full hover:bg-muted text-foreground transition-colors"
                  aria-label="Tambah"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
