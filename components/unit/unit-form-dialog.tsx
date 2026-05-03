"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";

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
import { createUnitRequestSchema } from "@/lib/schemas/unit";
import type { CreateUnitRequest } from "@/lib/types/unit";
import { cn } from "@/lib/utils";
import { DEFAULT_UNIT_FORM_VALUES } from "@/lib/unit/constants";

type UnitFormDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: CreateUnitRequest;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateUnitRequest) => Promise<void>;
};

export function UnitFormDialog({
  title,
  description,
  submitLabel,
  open,
  onOpenChange,
  initialValues = DEFAULT_UNIT_FORM_VALUES,
  isPending,
  errorMessage,
  onSubmit,
}: UnitFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUnitRequest>({
    resolver: zodResolver(createUnitRequestSchema) as Resolver<CreateUnitRequest>,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) reset(initialValues);
  }, [initialValues, open, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset(DEFAULT_UNIT_FORM_VALUES);
    } catch {
      // Errors are handled by the mutation hooks
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
      <div className="space-y-2">
        <Label htmlFor="business_unit_name">Nama Unit Usaha</Label>
        <Input
          id="business_unit_name"
          placeholder="Masukkan nama unit usaha"
          className={cn(
            "py-5",
            errors.business_unit_name &&
              "border-destructive focus-visible:ring-destructive",
          )}
          disabled={isPending}
          {...register("business_unit_name")}
        />
        {errors.business_unit_name && (
          <p className="text-xs text-destructive">
            {errors.business_unit_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_unit_address">Alamat</Label>
        <Input
          id="business_unit_address"
          placeholder="Masukkan alamat unit usaha"
          className={cn(
            "py-5",
            errors.business_unit_address &&
              "border-destructive focus-visible:ring-destructive",
          )}
          disabled={isPending}
          {...register("business_unit_address")}
        />
        {errors.business_unit_address && (
          <p className="text-xs text-destructive">
            {errors.business_unit_address.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_unit_phone">Nomor Telepon</Label>
        <Input
          id="business_unit_phone"
          placeholder="Masukkan nomor telepon"
          className={cn(
            "py-5",
            errors.business_unit_phone &&
              "border-destructive focus-visible:ring-destructive",
          )}
          disabled={isPending}
          {...register("business_unit_phone")}
        />
        {errors.business_unit_phone && (
          <p className="text-xs text-destructive">
            {errors.business_unit_phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="is_active">Status Keaktifan Unit Usaha</Label>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={field.onChange}
              disabled={isPending}
            >
              <SelectTrigger
                id="status"
                className={cn(
                  "w-full bg-background py-5",
                  errors.is_active &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              >
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.is_active && (
          <p className="text-xs text-destructive">{errors.is_active.message}</p>
        )}
      </div>
    </CrudFormDialog>
  );
}
