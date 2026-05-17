"use client";

import { useMemo } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { buildMenuToggleColumns } from "@/components/menu/menu-toggle-columns";
import { getErrorMessage } from "@/lib/api/client";
import { useUnitMenuTogglePage } from "@/lib/menu/use-unit-menu-toggle-page";
import { PageHeader } from "@/components/dashboard/ui";

/**
 * /unit/menu — Menu management for TIM_DAPUR and STAF_UNIT.
 *
 * Read-only list of the unit's menus with a single allowed action:
 * toggling `is_available` (Aktif / Nonaktif) per item.
 *
 * Creating or deleting menus is intentionally not exposed here.
 */
export default function UnitMenuPage() {
  const p = useUnitMenuTogglePage();

  const columns = useMemo(
    () =>
      buildMenuToggleColumns({
        onAvailabilityChange: p.toggle.handle,
        togglingId: p.toggle.togglingId,
      }),
    [p.toggle.handle, p.toggle.togglingId],
  );

  return (
    <div className="space-y-6 p-8">
      {/* ── Page heading ── */}

      <PageHeader
        title="Kelola Menu"
        description={`Kelola ketersediaan menu untuk ${p.unitName}`}
      />

      {/* ── Error banner ── */}
      {p.query.isError && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat data menu</AlertTitle>
          <AlertDescription>{getErrorMessage(p.query.error)}</AlertDescription>
        </Alert>
      )}

      {/* ── Toggle error banner ── */}
      {p.toggle.error && (
        <Alert variant="destructive">
          <AlertTitle>Gagal mengubah status menu</AlertTitle>
          <AlertDescription>{p.toggle.error}</AlertDescription>
        </Alert>
      )}

      {/* ── Menu table card ── */}
      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">Daftar Menu</CardTitle>
          <CardDescription>
            Kolom <strong>Status Saat Ini</strong> menunjukkan kondisi menu.
            Gunakan switch di kolom <strong>Ubah Ketersediaan</strong> untuk
            menampilkan atau menyembunyikan menu dari halaman order.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <DataTable
            columns={columns}
            data={p.menuItems}
            isLoading={p.query.isLoading}
            searchColumn="menu_name"
            searchPlaceholder="Cari nama menu, kategori, harga..."
            emptyMessage="Belum ada item menu yang terdaftar."
            searchEmptyMessage="Item menu tidak ditemukan dari kata kunci pencarian."
            enableSorting
            enablePagination
            defaultPageSize={10}
            meta={p.query.meta}
            pagination={p.pagination}
            onPaginationChange={p.setPagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
