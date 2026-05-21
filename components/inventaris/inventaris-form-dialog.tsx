"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { CrudFormDialog } from "@/components/shared/crud-form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUomOptions } from "@/lib/queries/uom";
import {
  inventarisItemFormSchema,
  type InventarisItemFormValues,
} from "@/lib/schemas/inventaris";
import { cn } from "@/lib/utils";

const DEFAULT_VALUES: InventarisItemFormValues = {
  inventory_item_name: "",
  unit_of_measure: "",
  current_stock: 0,
  max_threshold: 1,
  min_threshold: 0,
  description: "",
};

type InventarisFormDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: InventarisItemFormValues;
  showCurrentStockField?: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: InventarisItemFormValues) => Promise<void>;
};

function mapServerErrorToInventarisField(
  message: string,
  showCurrentStockField: boolean,
): keyof InventarisItemFormValues | null {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("nama item") ||
    normalized.includes("nama barang") ||
    normalized.includes("conflict") ||
    normalized.includes("sudah digunakan")
  ) {
    return "inventory_item_name";
  }

  if (normalized.includes("satuan") || normalized.includes("unit of measure")) {
    return "unit_of_measure";
  }

  if (
    normalized.includes("minimum") ||
    normalized.includes("min threshold") ||
    normalized.includes("batas minimum")
  ) {
    return "min_threshold";
  }

  if (
    normalized.includes("maksimum") ||
    normalized.includes("maximum") ||
    normalized.includes("max threshold") ||
    normalized.includes("batas maksimum")
  ) {
    return "max_threshold";
  }

  if (
    showCurrentStockField &&
    (normalized.includes("stok saat ini") ||
      (normalized.includes("stok") &&
        !normalized.includes("minimum") &&
        !normalized.includes("maksimum")))
  ) {
    return "current_stock";
  }

  if (normalized.includes("deskripsi") || normalized.includes("description")) {
    return "description";
  }

  return null;
}

export function InventarisFormDialog({
  title,
  description,
  submitLabel,
  open,
  onOpenChange,
  initialValues = DEFAULT_VALUES,
  showCurrentStockField = true,
  isPending,
  errorMessage,
  onSubmit,
}: InventarisFormDialogProps) {
  const {
    data: uomOptions = [],
    isLoading: isLoadingUom,
    isError: isUomError,
  } = useUomOptions();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InventarisItemFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(inventarisItemFormSchema) as any,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) reset(initialValues);
  }, [initialValues, open, reset]);

  const mappedServerField =
    open && errorMessage
      ? mapServerErrorToInventarisField(errorMessage, showCurrentStockField)
      : null;

  const generalErrorMessage =
    errorMessage && !mappedServerField ? errorMessage : null;

  useEffect(() => {
    if (!open || !errorMessage || !mappedServerField) return;

    setError(mappedServerField, {
      type: "server",
      message: errorMessage,
    });
  }, [errorMessage, mappedServerField, open, setError]);

  function clearServerFeedback(field: keyof InventarisItemFormValues): void {
    clearErrors(field);
  }

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
      errorMessage={generalErrorMessage}
      contentClassName="w-120"
      onSubmit={(event) => {
        void onFormSubmit(event);
      }}
    >
      {/* Nama Barang */}
      <div className="space-y-2">
        <Label htmlFor="inventory_item_name">Nama Barang</Label>
        <Input
          id="inventory_item_name"
          placeholder="Masukkan nama barang"
          className={cn(
            "py-5",
            errors.inventory_item_name &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("inventory_item_name", {
            onChange: () => clearServerFeedback("inventory_item_name"),
          })}
        />
        {errors.inventory_item_name && (
          <p className="text-xs text-destructive">
            {errors.inventory_item_name.message}
          </p>
        )}
      </div>

      {/* Satuan Pengukuran */}
      <div className="space-y-2">
        <Label htmlFor="unit_of_measure">Satuan Pengukuran</Label>
        <Controller
          name="unit_of_measure"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                clearServerFeedback("unit_of_measure");
                field.onChange(value);
              }}
              disabled={isLoadingUom}
            >
              <SelectTrigger
                id="unit_of_measure"
                className={cn(
                  "h-10",
                  errors.unit_of_measure &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              >
                <SelectValue
                  placeholder={
                    isLoadingUom
                      ? "Memuat pilihan..."
                      : "Pilih satuan pengukuran"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isUomError ? (
                  <div className="px-2 py-3 text-sm text-destructive">
                    Gagal memuat pilihan. Coba lagi nanti.
                  </div>
                ) : (
                  uomOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.unit_of_measure && (
          <p className="text-xs text-destructive">
            {errors.unit_of_measure.message}
          </p>
        )}
      </div>

      {showCurrentStockField && (
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
            {...register("current_stock", {
              onChange: () => clearServerFeedback("current_stock"),
            })}
          />
          {errors.current_stock && (
            <p className="text-xs text-destructive">
              {errors.current_stock.message}
            </p>
          )}
        </div>
      )}

      {/* Batas Maksimum Stok */}
      <div className="space-y-2">
        <Label htmlFor="max_threshold">Batas Maksimum Stok</Label>
        <Input
          id="max_threshold"
          type="number"
          min={1}
          placeholder="100"
          className={cn(
            "py-5",
            errors.max_threshold &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("max_threshold", {
            onChange: () => clearServerFeedback("max_threshold"),
          })}
        />
        {errors.max_threshold && (
          <p className="text-xs text-destructive">
            {errors.max_threshold.message}
          </p>
        )}
      </div>

      {/* Batas Minimum Stok */}
      <div className="space-y-2">
        <Label htmlFor="min_threshold">Batas Minimum Stok</Label>
        <Input
          id="min_threshold"
          type="number"
          min={0}
          placeholder="10"
          className={cn(
            "py-5",
            errors.min_threshold &&
              "border-destructive focus-visible:ring-destructive",
          )}
          {...register("min_threshold", {
            onChange: () => clearServerFeedback("min_threshold"),
          })}
        />
        {errors.min_threshold && (
          <p className="text-xs text-destructive">
            {errors.min_threshold.message}
          </p>
        )}
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          placeholder="Deskripsi barang (opsional)"
          className="py-5"
          {...register("description", {
            onChange: () => clearServerFeedback("description"),
          })}
        />
      </div>
    </CrudFormDialog>
  );
}
