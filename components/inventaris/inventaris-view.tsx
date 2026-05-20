"use client";

import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Loader2, Plus, Search } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/client";
import type { InventarisRow } from "@/lib/inventaris/types";
import type { InventarisItemFormValues } from "@/lib/schemas/inventaris";

// ── Shared query shape ────────────────────────────────────────────────────────

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type QueryState = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  meta?: PaginationMeta;
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
  // ── server-side pagination & search ──
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  search?: string;
  onSearchChange?: (value: string) => void;
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
  // ── server-side pagination & search ──
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  search?: string;
  onSearchChange?: (value: string) => void;
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
    pagination,
    onPaginationChange,
    search,
    onSearchChange,
  } = props;

  // Edit-confirm dialog state — lives here so the form dialog and the confirm
  // dialog can share it without lifting state to the caller page.
  const [pendingUpdateValues, setPendingUpdateValues] =
    useState<InventarisItemFormValues | null>(null);
  const [editDraftValues, setEditDraftValues] =
    useState<InventarisItemFormValues | null>(null);
  const [searchInput, setSearchInput] = useState(() => search ?? "");

  useEffect(() => {
    if (!onSearchChange) return;

    const timeoutId = window.setTimeout(() => {
      const normalized = searchInput.trim();
      const nextValue = normalized.length > 0 ? normalized : "";
      if (nextValue !== (search ?? "")) {
        onSearchChange(nextValue);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput, search, onSearchChange]);

  const editHandler = canEdit ? props.setEditingItem : undefined;
  const deleteHandler = canEdit ? props.setDeletingItem : undefined;

  const columns = useMemo(
    () =>
      buildInventarisColumns({
        onView: setViewingItem,
        ...(editHandler && { onEdit: editHandler }),
        ...(deleteHandler && { onDelete: deleteHandler }),
      }),
    [setViewingItem, editHandler, deleteHandler],
  );

  async function handleEditSubmit(values: InventarisItemFormValues) {
    setEditDraftValues(values);
    setPendingUpdateValues(values);
  }

  async function handleEditConfirm() {
    if (!canEdit || !pendingUpdateValues) return;
    try {
      await props.update.handle(pendingUpdateValues);
      setPendingUpdateValues(null);
      setEditDraftValues(null);
    } catch {
      // Keep the user in edit form and show field-mapped error there.
      setPendingUpdateValues(null);
    }
  }

  const isEditConfirmOpen =
    canEdit && !!pendingUpdateValues && !!props.editingItem;
  const showStatsSkeleton = query.isLoading && stats.length === 0;

  return (
    <div className="space-y-6 p-8">
      {/* ── Optional header slot (back Button, unit info, etc.) ── */}
      {headerSlot}

      {/* ── Stats cards ── */}
      {showStatsSkeleton ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} columns={4} />
      )}

      {/* ── Table card ── */}
      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
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

          {/* ── Search + Add Button row ── */}
          <div className="flex items-center justify-between gap-4">
            {onSearchChange ? (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari barang inventaris..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8 h-9 w-56"
                />
              </div>
            ) : (
              <div />
            )}

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

          <DataTable
            columns={columns}
            data={items}
            isLoading={query.isLoading}
            emptyMessage="Belum ada item inventaris yang terdaftar."
            searchEmptyMessage="Item inventaris tidak ditemukan dari kata kunci pencarian."
            enableSorting
            enablePagination
            defaultPageSize={10}
            {...(pagination && onPaginationChange
              ? {
                  meta: query.meta,
                  pagination,
                  onPaginationChange,
                }
              : {})}
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
              if (!open) {
                props.setEditingItem(null);
                setEditDraftValues(null);
              }
            }}
            initialValues={editDraftValues ?? props.editInitialValues}
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
                setEditDraftValues(null);
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPendingUpdateValues(null);
                    props.setEditingItem(null);
                    setEditDraftValues(null);
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
