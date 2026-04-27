"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUnitRequestSchema,
  type CreateUnitRequest,
} from "@/lib/schemas/unit";
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
    resolver: zodResolver(createUnitRequestSchema),
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <DialogContent className="w-120 bg-primary-foreground p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={onFormSubmit}>
          <div className="space-y-2">
            <Label htmlFor="unit_name">Nama Unit Usaha</Label>
            <Input
              id="unit_name"
              placeholder="Masukkan nama unit usaha"
              className={cn(
                "py-5",
                errors.unit_name &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              disabled={isPending}
              {...register("unit_name")}
            />
            {errors.unit_name && (
              <p className="text-xs text-destructive">
                {errors.unit_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_address">Alamat</Label>
            <Input
              id="unit_address"
              placeholder="Masukkan alamat unit usaha"
              className={cn(
                "py-5",
                errors.unit_address &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              disabled={isPending}
              {...register("unit_address")}
            />
            {errors.unit_address && (
              <p className="text-xs text-destructive">
                {errors.unit_address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Nomor Telepon</Label>
            <Input
              id="phone_number"
              placeholder="Masukkan nomor telepon"
              className={cn(
                "py-5",
                errors.phone_number &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              disabled={isPending}
              {...register("phone_number")}
            />
            {errors.phone_number && (
              <p className="text-xs text-destructive">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Keaktifan Unit Usaha</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="status"
                    className={cn(
                      "w-full bg-background py-5",
                      errors.status &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  >
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batalkan
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
