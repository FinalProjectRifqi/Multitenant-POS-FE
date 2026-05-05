"use client";

import { InventarisView } from "@/components/inventaris/inventaris-view";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useUnitInventarisPage } from "@/lib/inventaris/use-unit-inventaris-page";

export function UnitInventarisPageContent() {
  const currentUser = useCurrentUser();
  const unitId = currentUser?.unit?.unit_id ?? "";
  const unitName = currentUser?.unit?.unit_name ?? undefined;

  const p = useUnitInventarisPage(unitId, unitName);

  return (
    <InventarisView
      canEdit={true}
      title="Daftar Inventaris Unit Usaha"
      description="Seluruh barang inventaris yang terdaftar pada unit usaha Anda"
      headerSlot={
        <section className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Kelola Inventaris
          </h1>
          <p className="text-sm text-muted-foreground">
            Manajemen inventaris barang pada unit usaha Anda
          </p>
        </section>
      }
      items={p.items}
      stats={p.stats}
      query={p.query}
      viewingItem={p.viewingItem}
      setViewingItem={p.setViewingItem}
      pagination={p.pagination}
      onPaginationChange={p.setPagination}
      search={p.search}
      onSearchChange={p.setSearch}
      isCreateOpen={p.isCreateOpen}
      setIsCreateOpen={p.setIsCreateOpen}
      editingItem={p.editingItem}
      setEditingItem={p.setEditingItem}
      deletingItem={p.deletingItem}
      setDeletingItem={p.setDeletingItem}
      editInitialValues={p.editInitialValues}
      create={p.create}
      update={p.update}
      delete={p.delete}
    />
  );
}
