"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { CrudFormDialog } from "@/components/shared/crud-form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inventarisItemFormSchema,
  type InventarisItemFormValues,
} from "@/lib/schemas/inventaris";
import { cn } from "@/lib/utils";

const DEFAULT_VALUES: InventarisItemFormValues = {
  item_name: "",
  unit_of_measurement: "",
  current_stock: 0,
  max_stock: 1,
  min_stock: 0,
  description: "",
};

type InventarisFormDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: InventarisItemFormValues;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: InventarisItemFormValues) => Promise<void>;
};

export function InventarisFormDialog({
  title,
  description,
  submitLabel,
  open,
  onOpenChange,
  initialValues = DEFAULT_VALUES,
  isPending,
  errorMessage,
  onSubmit,
}: InventarisFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventarisItemFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inventarisItemFormSchema) as any,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) reset(initialValues);
  }, [initialValues, open, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset(DEFAULT_VALUES);
    } catch {
      // Errors handled by mutation hooks
    }
  });

  return (
    <CrudFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      submitLabel={submitLabel}
      submitPendingLabel="Menyimpan..."
      isPending={isPending}
      errorMessage={errorMessage}
      contentClassName="w-120"
      onSubmit={(event) => {
        void onFormSubmit(event);
      }}
    >
      {/* Nama Barang */}
      <div className="space-y-2">
        <Label htmlFor="item_name">Nama Barang</Label>
        <Input
          id="item_name"
          placeholder="Masukkan nama barang"
          className={cn(
            "py-5",
            errors.item_name &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("item_name")}
        />
        {errors.item_name && (
          <p className="text-xs text-destructive">{errors.item_name.message}</p>
        )}
      </div>

      {/* Satuan Pengukuran */}
      <div className="space-y-2">
        <Label htmlFor="unit_of_measurement">Satuan Pengukuran</Label>
        <Input
          id="unit_of_measurement"
          placeholder="Contoh: Kg, Liter, Botol"
          className={cn(
            "py-5",
            errors.unit_of_measurement &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("unit_of_measurement")}
        />
        {errors.unit_of_measurement && (
          <p className="text-xs text-destructive">
            {errors.unit_of_measurement.message}
          </p>
        )}
      </div>

      {/* Stok Saat Ini */}
      <div className="space-y-2">
        <Label htmlFor="current_stock">Stok Saat Ini</Label>
        <Input
          id="current_stock"
          type="number"
          min={0}
          placeholder="0"
          className={cn(
            "py-5",
            errors.current_stock &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("current_stock")}
        />
        {errors.current_stock && (
          <p className="text-xs text-destructive">
            {errors.current_stock.message}
          </p>
        )}
      </div>

      {/* Batas Maksimum Stok */}
      <div className="space-y-2">
        <Label htmlFor="max_stock">Batas Maksimum Stok</Label>
        <Input
          id="max_stock"
          type="number"
          min={1}
          placeholder="100"
          className={cn(
            "py-5",
            errors.max_stock &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("max_stock")}
        />
        {errors.max_stock && (
          <p className="text-xs text-destructive">{errors.max_stock.message}</p>
        )}
      </div>

      {/* Batas Minimum Stok */}
      <div className="space-y-2">
        <Label htmlFor="min_stock">Batas Minimum Stok</Label>
        <Input
          id="min_stock"
          type="number"
          min={0}
          placeholder="10"
          className={cn(
            "py-5",
            errors.min_stock &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("min_stock")}
        />
        {errors.min_stock && (
          <p className="text-xs text-destructive">{errors.min_stock.message}</p>
        )}
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          placeholder="Deskripsi barang (opsional)"
          className="py-5"
          {...register("description")}
        />
      </div>
    </CrudFormDialog>
  );
}
