"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatsGrid } from "@/components/shared/stats-grid";
import { getErrorMessage } from "@/lib/api/client";
import { buildMenuItemColumns } from "@/components/menu/menu-item-table-columns";
import { MenuFormDialog } from "@/components/menu/menu-form-dialog";
import { MenuDetailDialog } from "@/components/menu/menu-detail-dialog";
import { useUnitMenuPage } from "@/lib/menu/use-unit-menu-page";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ unitId: string }>();
  const unitId = params.unitId;

  const p = useUnitMenuPage(unitId);

  const columns = useMemo(
    () =>
      buildMenuItemColumns({
        onView: p.setViewingItem,
        onEdit: p.setEditingItem,
        onDelete: p.setDeletingItem,
      }),
    [p.setViewingItem, p.setEditingItem, p.setDeletingItem],
  );

  return (
    <div className="space-y-6 p-8">
      {/* ── Back button + Page heading ── */}
      <section className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => router.push("/group/menu")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pilih Unit
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Kelola Menu
          </h1>

          {/* Unit info subtitle */}
          {p.query.isLoading ? (
            <Skeleton className="h-5 w-64 rounded" />
          ) : p.selectedUnit ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>
              {p.selectedUnit ? p.selectedUnit.business_unit_name : "Memuat..."}
                <span className="mx-1.5 text-border">•</span>
                {p.selectedUnit.business_unit_address}
              </span>
            </div>
          ) : (
            <p className="text-sm text-destructive">
              Unit usaha tidak ditemukan.
            </p>
          )}
        </div>
      </section>

      {/* ── Stats cards ── */}
      <StatsGrid stats={p.stats} columns={4} />

      {/* ── Menu table card ── */}
      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">Daftar Menu</CardTitle>
          <CardDescription>
            {p.selectedUnit
              ? `Menu yang tersedia di ${p.selectedUnit.business_unit_name}`
              : "Daftar menu pada unit terpilih"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {p.query.isError && (
            <Alert variant="destructive">
              <AlertTitle>Gagal memuat data menu</AlertTitle>
              <AlertDescription>
                {getErrorMessage(p.query.error)}
              </AlertDescription>
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={p.menuItems}
            isLoading={p.query.isLoading}
            // Search — points to the column whose filterFn handles all fields
            searchColumn="menu_item_name"
            searchPlaceholder="Cari nama menu, kategori, harga, status..."
            // Toolbar CTA
            actionLabel={p.canCreateMenu ? "Tambah Menu" : null}
            onActionClick={() => p.setIsCreateOpen(true)}
            // Empty states
            emptyMessage={
              p.categoriesForUnit.length === 0
                ? "Belum ada kategori menu untuk unit ini. Tambahkan kategori terlebih dahulu."
                : "Belum ada item menu yang terdaftar."
            }
            searchEmptyMessage="Item menu tidak ditemukan dari kata kunci pencarian."
            // Features
            enableSorting
            enablePagination
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* ── Create dialog ── */}
      <MenuFormDialog
        title="Tambah Menu Baru"
        description="Isi form di bawah untuk menambahkan item menu baru."
        submitLabel="Tambah"
        open={p.isCreateOpen}
        onOpenChange={p.setIsCreateOpen}
        initialValues={p.createInitialValues}
        isPending={p.create.isPending}
        errorMessage={p.create.error}
        onSubmit={p.create.handle}
        categories={p.categoriesForUnit}
      />

      {/* ── Edit dialog ── */}
      <MenuFormDialog
        title="Edit Menu"
        description="Perbarui informasi item menu yang dipilih."
        submitLabel="Simpan Perubahan"
        open={Boolean(p.editingItem)}
        onOpenChange={(open) => {
          if (!open) p.setEditingItem(null);
        }}
        initialValues={p.editInitialValues}
        isPending={p.update.isPending}
        errorMessage={p.update.error}
        onSubmit={p.update.handle}
        categories={p.categoriesForUnit}
      />

      {/* ── View dialog ── */}
      <MenuDetailDialog
        menuItem={p.viewingItem}
        open={Boolean(p.viewingItem)}
        onOpenChange={(open) => {
          if (!open) p.setViewingItem(null);
        }}
      />

      {/* ── Delete dialog ── */}
      <ConfirmDeleteDialog
        open={Boolean(p.deletingItem)}
        onOpenChange={(open) => {
          if (!open) p.setDeletingItem(null);
        }}
        title="Hapus Menu"
        description={
          <>
            Tindakan ini tidak dapat dibatalkan. Menu{" "}
            <strong>{p.deletingItem?.menu_item_name ?? "item menu"}</strong>{" "}
            akan dihapus permanen.
          </>
        }
        isPending={p.delete.isPending}
        errorMessage={p.delete.error}
        onConfirm={p.delete.handle}
      />
    </div>
  );
}
