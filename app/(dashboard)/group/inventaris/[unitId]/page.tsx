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
import { DataTable } from "@/components/shared/data-table";
import { StatsGrid } from "@/components/shared/stats-grid";
import { getErrorMessage } from "@/lib/api/client";
import { buildInventarisColumns } from "@/components/inventaris/inventaris-table-columns";
import { InventarisDetailDialog } from "@/components/inventaris/inventaris-detail-dialog";
import { useGroupInventarisUnitPage } from "@/lib/inventaris/use-group-inventaris-page";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ unitId: string }>();
  const unitId = params.unitId;

  const p = useGroupInventarisUnitPage(unitId);

  const columns = useMemo(
    () => buildInventarisColumns({ onView: p.setViewingItem }),
    [p.setViewingItem],
  );

  return (
    <div className="space-y-6 p-8">
      {/* ── Back button + Page heading ── */}
      <section className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => router.push("/group/inventaris")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pilih Unit
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {p.query.isLoading ? (
              <Skeleton className="h-9 w-72 rounded" />
            ) : (
              `Kelola Inventaris${p.selectedUnit ? ` ${p.selectedUnit.unit_name}` : ""}`
            )}
          </h1>

          {/* Unit info subtitle */}
          {p.query.isLoading ? (
            <Skeleton className="h-5 w-64 rounded" />
          ) : p.selectedUnit ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>
                {p.selectedUnit.unit_name}
                <span className="mx-1.5 text-border">•</span>
                {p.selectedUnit.unit_address}
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
      <StatsGrid stats={p.stats} columns={3} />

      {/* ── Inventaris table card ── */}
      <Card className="bg-primary-foreground ring-1 ring-border/90">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Daftar Inventaris Unit Usaha
          </CardTitle>
          <CardDescription>
            {p.selectedUnit
              ? `Kelola Daftar Inventaris yang Tersedia di ${p.selectedUnit.unit_name}`
              : "Daftar barang inventaris pada unit terpilih"}
          </CardDescription>
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
            searchPlaceholder="Cari nama barang, satuan, stok..."
            emptyMessage="Belum ada item inventaris yang terdaftar untuk unit ini."
            searchEmptyMessage="Item inventaris tidak ditemukan dari kata kunci pencarian."
            enableSorting
            enablePagination
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* ── View detail dialog ── */}
      <InventarisDetailDialog
        item={p.viewingItem}
        open={Boolean(p.viewingItem)}
        onOpenChange={(open) => {
          if (!open) p.setViewingItem(null);
        }}
      />
    </div>
  );
}
