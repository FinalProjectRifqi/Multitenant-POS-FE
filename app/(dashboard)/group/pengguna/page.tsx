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
import { UserDetailDialog } from "@/components/user/user-detail-dialog";
import { UserFormDialog } from "@/components/user/user-form-dialog";
import { UserCredentialsDialog } from "@/components/user/user-credentials-dialog";
import { buildUserColumns } from "@/components/user/user-table-columns";
import { getErrorMessage } from "@/lib/api/client";
import { useUserPage } from "@/lib/user/use-user-page";
import { PaginationMeta } from "@/lib/types/user/user";

export default function Page() {
  const p = useUserPage();

  const columns = useMemo(
    () =>
      buildUserColumns({
        onEdit: p.setEditingUser,
        onDelete: p.setDeletingUser,
        onView: p.setViewingUser,
      }),
    [p.setEditingUser, p.setDeletingUser, p.setViewingUser],
  );

  return (
    <div className="space-y-5 p-8">
      <section className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Kelola Pengguna
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola semua pengguna dalam sistem Anda
        </p>
      </section>

      <StatsGrid stats={p.stats} columns={3} />

      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Daftar Pengguna
          </CardTitle>
          <CardDescription>
            Kelola semua pengguna dalam sistem Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {p.query.isError && (
            <Alert variant="destructive">
              <AlertTitle>Gagal memuat data pengguna</AlertTitle>
              <AlertDescription>
                {getErrorMessage(p.query.error)}
              </AlertDescription>
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={p.users}
            isLoading={p.query.isLoading}
            searchColumn="full_name"
            searchPlaceholder="Cari nama, username, email, role, unit, status..."
            actionLabel="Tambah Pengguna"
            onActionClick={() => p.setIsCreateOpen(true)}
            emptyMessage="Belum ada pengguna yang terdaftar."
            searchEmptyMessage="Data pengguna tidak ditemukan dari kata kunci pencarian."
            enableSorting
            enablePagination
            defaultPageSize={10}
            meta={p.query.meta as PaginationMeta | undefined}
            pagination={p.pagination}
            onPaginationChange={p.setPagination}
          />
        </CardContent>
      </Card>

      <UserFormDialog
        title="Tambah Pengguna"
        description="Isi form di bawah untuk menambah pengguna baru."
        submitLabel="Tambah"
        open={p.isCreateOpen}
        onOpenChange={p.setIsCreateOpen}
        isPending={p.create.isPending}
        errorMessage={p.create.error}
        onSubmit={p.create.handle}
      />

      <UserFormDialog
        title="Edit Pengguna"
        description="Perbarui informasi pengguna yang dipilih."
        submitLabel="Simpan Perubahan"
        open={Boolean(p.editingUser)}
        onOpenChange={(open) => {
          if (!open) p.setEditingUser(null);
        }}
        initialValues={p.editInitialValues}
        isPending={p.update.isPending}
        errorMessage={p.update.error}
        requirePassword={false}
        onSubmit={p.update.handle}
      />

      <UserDetailDialog
        user={p.viewingUser}
        open={Boolean(p.viewingUser)}
        onOpenChange={(open) => {
          if (!open) p.setViewingUser(null);
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(p.deletingUser)}
        onOpenChange={(open) => {
          if (!open) p.setDeletingUser(null);
        }}
        title="Hapus Pengguna"
        description={
          <>
            Tindakan ini tidak dapat dibatalkan. Pengguna{" "}
            <strong>{p.deletingUser?.user_name ?? "pengguna"}</strong> akan
            dihapus permanen.
          </>
        }
        isPending={p.delete.isPending}
        errorMessage={p.delete.error}
        onConfirm={p.delete.handle}
      />

      <UserCredentialsDialog
        open={Boolean(p.createdCredentials)}
        onOpenChange={(open) => {
          if (!open) p.setCreatedCredentials(null);
        }}
        credentials={p.createdCredentials}
      />
    </div>
  );
}
