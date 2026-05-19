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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api/client";
import { PaginationMeta } from "@/lib/schemas/unit";
import { useUserPage } from "@/lib/user/use-user-page";
import { UserCredentialsDialog } from "./user-credentials-dialog";
import { UserDetailDialog } from "./user-detail-dialog";
import { UserFormDialog } from "./user-form-dialog";
import { buildUserColumns } from "./user-table-columns";

/**
 * UserPageContent — Client Component
 *
 * This component handles all the interactive logic: state management, mutations,
 * and dialog rendering. The query data comes from the prefetched data in the
 * HydrationBoundary above, so it's immediately available.
 */
export function UserPageContent() {
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
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          Kelola Pengguna
        </h1>
        <p className="text-primary/90 font-semibold">
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
            searchValue={p.search}
            onSearchChange={p.setSearch}
            actionLabel="Tambah Pengguna"
            onActionClick={() => p.setIsCreateOpen(true)}
            extraControls={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Select
                  value={p.filters.businessUnitId}
                  onValueChange={p.filters.setBusinessUnitId}
                  disabled={p.filters.isLoadingUnits}
                >
                  <SelectTrigger className="h-9 w-full bg-background sm:w-52">
                    <SelectValue placeholder="Unit Usaha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={p.filters.allValue}>
                      Semua Unit
                    </SelectItem>
                    {p.filters.units.map((unit) => (
                      <SelectItem
                        key={unit.business_unit_id}
                        value={unit.business_unit_id}
                      >
                        {unit.business_unit_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={p.filters.roleId}
                  onValueChange={p.filters.setRoleId}
                  disabled={p.filters.isLoadingRoles}
                >
                  <SelectTrigger className="h-9 w-full bg-background sm:w-44">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={p.filters.allValue}>
                      Semua Role
                    </SelectItem>
                    {p.filters.roles.map((role) => (
                      <SelectItem key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
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
