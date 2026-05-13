"use client";

import { useMemo } from "react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatsGrid } from "@/components/shared/stats-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UnitDetailDialog } from "@/components/unit/unit-detail-dialog";
import { UnitFormDialog } from "@/components/unit/unit-form-dialog";
import { buildUnitColumns } from "@/components/unit/unit-table-columns";
import { getErrorMessage } from "@/lib/api/client";
import { useUnitPage } from "@/lib/unit/use-unit-page";
import { PageHeader } from "../dashboard/ui";

/**
 * UnitPageContent — Client Component
 *
 * This component handles all the interactive logic: state management, mutations,
 * and dialog rendering. The query data comes from the prefetched data in the
 * HydrationBoundary above, so it's immediately available.
 */
export function UnitPageContent() {
  const p = useUnitPage();

  const columns = useMemo(
    () =>
      buildUnitColumns({
        onEdit: p.setEditingUnit,
        onDelete: p.setDeletingUnit,
        onView: p.setViewingUnit,
      }),
    [p.setEditingUnit, p.setDeletingUnit, p.setViewingUnit],
  );

  return (
    <div className="space-y-5 p-8">
      {/* ── Page heading ── */}
      <PageHeader
        title="Kelola Unit Usaha"
        description="Kelola semua unit usaha, cabang, dan lokasi bisnis Anda"
      />

      {/* ── Stat cards ── */}
      <StatsGrid stats={p.stats} columns={3} />

      {/* ── Table card ── */}
      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Daftar Unit Usaha
          </CardTitle>
          <CardDescription>
            Kelola semua unit usaha, cabang, dan lokasi bisnis Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {p.query.isError && (
            <Alert variant="destructive">
              <AlertTitle>Gagal memuat data unit usaha</AlertTitle>
              <AlertDescription>
                {getErrorMessage(p.query.error)}
              </AlertDescription>
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={p.units}
            isLoading={p.query.isLoading}
            // Search — points to the column whose filterFn handles all fields
            searchColumn="business_unit_name"
            searchPlaceholder="Cari nama, alamat, telepon, status..."
            // Toolbar CTA
            actionLabel="Tambah Unit Usaha"
            onActionClick={() => p.setIsCreateOpen(true)}
            // Empty states
            emptyMessage="Belum ada unit usaha yang terdaftar."
            searchEmptyMessage="Data unit usaha tidak ditemukan dari kata kunci pencarian."
            extraControls={
              <div className="flex items-center gap-2">
                <Switch
                  id="show-inactive"
                  checked={p.showInactive}
                  onCheckedChange={p.setShowInactive}
                />
                <Label htmlFor="show-inactive" className="cursor-pointer">
                  Tampilkan Nonaktif
                </Label>
              </div>
            }
            // Features
            enableSorting
            enablePagination
            defaultPageSize={10}
            meta={p.query.meta}
            pagination={p.pagination}
            onPaginationChange={p.setPagination}
          />
        </CardContent>
      </Card>

      {/* ── Create dialog ── */}
      <UnitFormDialog
        title="Tambah Unit Usaha"
        description="Isi form di bawah untuk menambah unit usaha baru."
        submitLabel="Tambah"
        open={p.isCreateOpen}
        onOpenChange={p.setIsCreateOpen}
        isPending={p.create.isPending}
        errorMessage={p.create.error}
        onSubmit={p.create.handle}
      />

      {/* ── Edit dialog ── */}
      <UnitFormDialog
        title="Edit Unit Usaha"
        description="Perbarui informasi unit usaha yang dipilih."
        submitLabel="Simpan Perubahan"
        open={Boolean(p.editingUnit)}
        onOpenChange={(open) => {
          if (!open) p.setEditingUnit(null);
        }}
        initialValues={p.editInitialValues}
        isPending={p.update.isPending}
        errorMessage={p.update.error}
        onSubmit={p.update.handle}
      />

      {/* ── View dialog ── */}
      <UnitDetailDialog
        unit={p.viewingUnit}
        open={Boolean(p.viewingUnit)}
        onOpenChange={(open) => {
          if (!open) p.setViewingUnit(null);
        }}
      />

      {/* ── Delete dialog ── */}
      <ConfirmDeleteDialog
        open={Boolean(p.deletingUnit)}
        onOpenChange={(open) => {
          if (!open) p.setDeletingUnit(null);
        }}
        title="Hapus Unit Usaha"
        description={
          <>
            Tindakan ini tidak dapat dibatalkan. Unit{" "}
            <strong>
              {p.deletingUnit?.business_unit_name ?? "unit usaha"}
            </strong>{" "}
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
