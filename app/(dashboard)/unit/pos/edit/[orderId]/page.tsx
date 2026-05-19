"use client";

// app/(dashboard)/unit/pos/edit/[orderId]/page.tsx

import { Search } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { CartPanel } from "@/components/orders/cart-panel";
import { MenuGrid } from "@/components/orders/menu-grid";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderFormPage } from "@/lib/orders/use-order-form-page";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EditPesananPageProps {
  params: Promise<{ orderId: string }>;
}

export default function EditPesananPage({ params }: EditPesananPageProps) {
  const { orderId } = use(params);

  const {
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
    subtotal,
    taxAmount,
    totalAmount,
    categories,
    filteredMenus,
    allMenus,
    isDineIn,
    isMutating,
    orderTypesQuery,
    orderDetailQuery,
    menusQuery,
    addToCart,
    updateCartQty,
    removeCartItem,
    clearCart,
    handleSubmit,
  } = useOrderFormPage("edit", orderId);

  const totalCartItems = cart.reduce((s, c) => s + c.quantity, 0);
  const orderNumber = orderDetailQuery.data?.data?.order_number;

  return (
    /*
     * Same two-column sticky layout as the "tambah" page.
     * See tambah/page.tsx for layout notes.
     */
    <div className="flex h-full overflow-hidden">
      {/* ══════════════════════════════════════════════════
          LEFT — scrollable menu column
         ══════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6 flex flex-col gap-4">
          {/* Back breadcrumb */}
          <Link
            href="/unit/pos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            ← Kembali ke Pesanan
          </Link>

          {/* Section header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight">Pilih Menu</h1>
              {!menusQuery.isLoading && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {allMenus.length} item tersedia
                  {totalCartItems > 0 && (
                    <span className="ml-1.5 font-medium text-primary">
                      · {totalCartItems} dalam pesanan
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Search */}
            <div className="relative w-56 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari menu..."
                className="pl-9 h-9 text-sm bg-white"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category tabs */}
          {menusQuery.isLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50",
                  )}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {/* Menu grid */}
          {menusQuery.isLoading || orderDetailQuery.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <MenuGrid
              menus={filteredMenus}
              cart={cart}
              onAdd={addToCart}
              onUpdateQty={updateCartQty}
            />
          )}

          {/* Mobile: cart panel flows below the grid */}
          <div className="lg:hidden mt-2">
            <CartPanel
              mode="edit"
              orderNumber={orderNumber}
              className="w-full"
              orderTypes={orderTypesQuery.data?.data ?? []}
              orderTypeId={orderTypeId}
              onOrderTypeChange={setOrderTypeId}
              isDineIn={isDineIn}
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              tableNumber={tableNumber}
              onTableNumberChange={setTableNumber}
              orderNotes={orderNotes}
              onOrderNotesChange={setOrderNotes}
              cart={cart}
              onUpdateQty={updateCartQty}
              onRemoveItem={removeCartItem}
              onClearCart={clearCart}
              subtotal={subtotal}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
              onSubmit={handleSubmit}
              isMutating={isMutating}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT — sticky cart sidebar (desktop only)
         ══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col w-96 xl:w-104 h-full shrink-0 border-l border-border">
        <CartPanel
          mode="edit"
          orderNumber={orderNumber}
          className="flex-1 h-full"
          orderTypes={orderTypesQuery.data?.data ?? []}
          orderTypeId={orderTypeId}
          onOrderTypeChange={setOrderTypeId}
          isDineIn={isDineIn}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          tableNumber={tableNumber}
          onTableNumberChange={setTableNumber}
          orderNotes={orderNotes}
          onOrderNotesChange={setOrderNotes}
          cart={cart}
          onUpdateQty={updateCartQty}
          onRemoveItem={removeCartItem}
          onClearCart={clearCart}
          subtotal={subtotal}
          taxAmount={taxAmount}
          totalAmount={totalAmount}
          onSubmit={handleSubmit}
          isMutating={isMutating}
        />
      </div>
    </div>
  );
}
