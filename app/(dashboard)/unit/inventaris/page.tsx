"use client";

import { Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { InventarisDetailDialog } from "@/components/inventaris/inventaris-detail-dialog";
import { InventarisFormDialog } from "@/components/inventaris/inventaris-form-dialog";
import { buildInventarisColumns } from "@/components/inventaris/inventaris-table-columns";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatsGrid } from "@/components/shared/stats-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useUnitInventarisPage } from "@/lib/inventaris/use-unit-inventaris-page";
import type { InventarisItemFormValues } from "@/lib/schemas/inventaris";

export default function Page() {
  const currentUser = useCurrentUser();
  const unitId = currentUser?.unit?.unit_id ?? "";

  const p = useUnitInventarisPage(unitId);

  const [pendingUpdateValues, setPendingUpdateValues] =
    useState<InventarisItemFormValues | null>(null);

  const columns = useMemo(
    () =>
      buildInventarisColumns({
        onView: p.setViewingItem,
        onEdit: p.setEditingItem,
        onDelete: p.setDeletingItem,
      }),
    [p.setViewingItem, p.setEditingItem, p.setDeletingItem],
  );

  async function handleEditSubmit(values: InventarisItemFormValues) {
    setPendingUpdateValues(values);
  }

  async function handleEditConfirm() {
    if (!pendingUpdateValues) return;
    await p.update.handle(pendingUpdateValues);
    setPendingUpdateValues(null);
  }

  const isEditConfirmOpen = !!pendingUpdateValues && !!p.editingItem;

  return (
    <div className="space-y-6 p-8">
      <section className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Kelola Inventaris
        </h1>
        <p className="text-sm text-muted-foreground">
          Manajemen inventaris barang pada unit usaha Anda
        </p>
      </section>

      {p.query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={p.stats} columns={3} />
      )}

      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                Daftar Inventaris Unit Usaha
              </CardTitle>
              <CardDescription>
                Seluruh barang inventaris yang terdaftar pada unit usaha Anda
              </CardDescription>
            </div>
            <Button
              onClick={() => p.setIsCreateOpen(true)}
              disabled={p.query.isLoading}
              className="shrink-0 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Inventaris
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {p.query.isError && (
            <Alert variant="destructive">
              <AlertTitle>Gagal memuat data inventaris</AlertTitle>
              <AlertDescription>
                {getErrorMessage(p.query.error)}
              </AlertDescription>
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={p.items}
            isLoading={p.query.isLoading}
            searchColumn="item_name"
            searchPlaceholder="Cari barang inventaris..."
            // filterColumnId="item_name"
            // filterPlaceholder="Cari barang inventaris..."
          />
        </CardContent>
      </Card>

      <InventarisFormDialog
        title="Tambah Barang Inventaris"
        description="Isi data barang inventaris baru untuk unit usaha Anda"
        submitLabel="Tambah"
        open={p.isCreateOpen}
        onOpenChange={p.setIsCreateOpen}
        isPending={p.create.isPending}
        errorMessage={p.create.error}
        onSubmit={p.create.handle}
      />

      <InventarisFormDialog
        title="Perbarui Barang Inventaris"
        description="Ubah data barang inventaris yang dipilih"
        submitLabel="Ubah"
        open={!!p.editingItem && !pendingUpdateValues}
        onOpenChange={(open) => {
          if (!open) p.setEditingItem(null);
        }}
        initialValues={p.editInitialValues}
        isPending={p.update.isPending}
        errorMessage={p.update.error}
        onSubmit={handleEditSubmit}
      />

      <Dialog
        open={isEditConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPendingUpdateValues(null);
            p.setEditingItem(null);
          }
        }}
      >
        <DialogContent className="w-[min(92vw,480px)] bg-primary-foreground p-4">
          <DialogHeader>
            <DialogTitle>Konfirmasi Perbarui Barang Inventaris</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan data Barang Inventaris
              ini?
            </DialogDescription>
          </DialogHeader>

          {p.update.error && (
            <Alert variant="destructive">
              <AlertDescription>{p.update.error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingUpdateValues(null);
                p.setEditingItem(null);
              }}
              disabled={p.update.isPending}
            >
              Batalkan
            </Button>
            <Button
              type="button"
              onClick={() => void handleEditConfirm()}
              disabled={p.update.isPending}
            >
              {p.update.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ubah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!p.deletingItem}
        onOpenChange={(open) => {
          if (!open) p.setDeletingItem(null);
        }}
        title="Konfirmasi Hapus Barang Inventaris"
        description="Apakah Anda yakin ingin menghapus data Barang Inventaris ini?"
        isPending={p.delete.isPending}
        errorMessage={p.delete.error}
        onConfirm={p.delete.handle}
        confirmLabel="Hapus"
      />

      <InventarisDetailDialog
        item={p.viewingItem}
        open={!!p.viewingItem}
        onOpenChange={(open) => {
          if (!open) p.setViewingItem(null);
        }}
      />
    </div>
  );
}
