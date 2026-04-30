"use client";

import { Loader2, Plus } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { InventarisDetailDialog } from "@/components/inventaris/inventaris-detail-dialog";
import { InventarisFormDialog } from "@/components/inventaris/inventaris-form-dialog";
import { buildInventarisColumns } from "@/components/inventaris/inventaris-table-columns";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatsGrid, type StatItem } from "@/components/shared/stats-grid";
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
import type { InventarisRow } from "@/lib/inventaris/types";
import type { InventarisItemFormValues } from "@/lib/schemas/inventaris";

// ── Shared query shape ────────────────────────────────────────────────────────

type QueryState = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

// ── CRUD action shapes ────────────────────────────────────────────────────────

type CreateAction = {
  isPending: boolean;
  error: string | null | undefined;
  handle: (values: InventarisItemFormValues) => Promise<void>;
};

type UpdateAction = {
  isPending: boolean;
  error: string | null | undefined;
  handle: (values: InventarisItemFormValues) => Promise<void>;
};

type DeleteAction = {
  isPending: boolean;
  error: string | null | undefined;
  handle: () => Promise<void>;
};

// ── Discriminated props type ──────────────────────────────────────────────────

type ViewOnlyProps = {
  /** Page title shown in the card header. */
  title: string;
  /** Page subtitle shown below the title. */
  description?: string;
  /**
   * Optional slot rendered above the stats cards.
   * Use it for back-navigation buttons, unit info headers, etc.
   */
  headerSlot?: ReactNode;
  /** Set false for read-only mode (MANAJEMEN_GRUP). */
  canEdit: false;
  // ── data ──
  items: InventarisRow[];
  stats: StatItem[];
  query: QueryState;
  viewingItem: InventarisRow | null;
  setViewingItem: (item: InventarisRow | null) => void;
};

type CrudProps = {
  title: string;
  description?: string;
  headerSlot?: ReactNode;
  /** Set true for full CRUD mode (MANAJER_UNIT). */
  canEdit: true;
  // ── data ──
  items: InventarisRow[];
  stats: StatItem[];
  query: QueryState;
  viewingItem: InventarisRow | null;
  setViewingItem: (item: InventarisRow | null) => void;
  // ── CRUD state ──
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  editingItem: InventarisRow | null;
  setEditingItem: (item: InventarisRow | null) => void;
  deletingItem: InventarisRow | null;
  setDeletingItem: (item: InventarisRow | null) => void;
  editInitialValues: InventarisItemFormValues;
  // ── CRUD actions ──
  create: CreateAction;
  update: UpdateAction;
  delete: DeleteAction;
};

export type InventarisViewProps = ViewOnlyProps | CrudProps;

// ── Component ─────────────────────────────────────────────────────────────────

export function InventarisView(props: InventarisViewProps) {
  const {
    title,
    description,
    headerSlot,
    canEdit,
    items,
    stats,
    query,
    viewingItem,
    setViewingItem,
  } = props;

  // Edit-confirm dialog state — lives here so the form dialog and the confirm
  // dialog can share it without lifting state to the caller page.
  const [pendingUpdateValues, setPendingUpdateValues] =
    useState<InventarisItemFormValues | null>(null);

  const columns = useMemo(
    () =>
      buildInventarisColumns({
        onView: setViewingItem,
        ...(canEdit && {
          onEdit: props.setEditingItem,
          onDelete: props.setDeletingItem,
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      canEdit,
      setViewingItem,
      canEdit ? props.setEditingItem : null,
      canEdit ? props.setDeletingItem : null,
    ],
  );

  async function handleEditSubmit(values: InventarisItemFormValues) {
    setPendingUpdateValues(values);
  }

  async function handleEditConfirm() {
    if (!canEdit || !pendingUpdateValues) return;
    await props.update.handle(pendingUpdateValues);
    setPendingUpdateValues(null);
  }

  const isEditConfirmOpen =
    canEdit && !!pendingUpdateValues && !!props.editingItem;

  return (
    <div className="space-y-6 p-8">
      {/* ── Optional header slot (back button, unit info, etc.) ── */}
      {headerSlot}

      {/* ── Stats cards ── */}
      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} columns={3} />
      )}

      {/* ── Table card ── */}
      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>

            {canEdit && (
              <Button
                onClick={() => props.setIsCreateOpen(true)}
                disabled={query.isLoading}
                className="shrink-0 cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Inventaris
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {query.isError && (
            <Alert variant="destructive">
              <AlertTitle>Gagal memuat data inventaris</AlertTitle>
              <AlertDescription>
                {getErrorMessage(query.error)}
              </AlertDescription>
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={items}
            isLoading={query.isLoading}
            searchColumn="item_name"
            searchPlaceholder="Cari barang inventaris..."
            emptyMessage="Belum ada item inventaris yang terdaftar."
            searchEmptyMessage="Item inventaris tidak ditemukan dari kata kunci pencarian."
            enableSorting
            enablePagination
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* ── Detail dialog (always available) ── */}
      <InventarisDetailDialog
        item={viewingItem}
        open={!!viewingItem}
        onOpenChange={(open) => {
          if (!open) setViewingItem(null);
        }}
      />

      {/* ── CRUD dialogs (only rendered in edit mode) ── */}
      {canEdit && (
        <>
          {/* Create dialog */}
          <InventarisFormDialog
            title="Tambah Barang Inventaris"
            description="Isi data barang inventaris baru untuk unit usaha Anda"
            submitLabel="Tambah"
            open={props.isCreateOpen}
            onOpenChange={props.setIsCreateOpen}
            isPending={props.create.isPending}
            errorMessage={props.create.error}
            onSubmit={props.create.handle}
          />

          {/* Edit dialog */}
          <InventarisFormDialog
            title="Perbarui Barang Inventaris"
            description="Ubah data barang inventaris yang dipilih"
            submitLabel="Ubah"
            open={!!props.editingItem && !pendingUpdateValues}
            onOpenChange={(open) => {
              if (!open) props.setEditingItem(null);
            }}
            initialValues={props.editInitialValues}
            isPending={props.update.isPending}
            errorMessage={props.update.error}
            onSubmit={handleEditSubmit}
          />

          {/* Edit confirm dialog */}
          <Dialog
            open={isEditConfirmOpen}
            onOpenChange={(open) => {
              if (!open) {
                setPendingUpdateValues(null);
                props.setEditingItem(null);
              }
            }}
          >
            <DialogContent className="w-[min(92vw,480px)] bg-primary-foreground p-4">
              <DialogHeader>
                <DialogTitle>Konfirmasi Perbarui Barang Inventaris</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menyimpan perubahan data Barang
                  Inventaris ini?
                </DialogDescription>
              </DialogHeader>

              {props.update.error && (
                <Alert variant="destructive">
                  <AlertDescription>{props.update.error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPendingUpdateValues(null);
                    props.setEditingItem(null);
                  }}
                  disabled={props.update.isPending}
                >
                  Batalkan
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleEditConfirm()}
                  disabled={props.update.isPending}
                >
                  {props.update.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Ubah
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete confirm dialog */}
          <ConfirmDeleteDialog
            open={!!props.deletingItem}
            onOpenChange={(open) => {
              if (!open) props.setDeletingItem(null);
            }}
            title="Konfirmasi Hapus Barang Inventaris"
            description="Apakah Anda yakin ingin menghapus data Barang Inventaris ini?"
            isPending={props.delete.isPending}
            errorMessage={props.delete.error}
            onConfirm={props.delete.handle}
            confirmLabel="Hapus"
          />
        </>
      )}
    </div>
  );
}
