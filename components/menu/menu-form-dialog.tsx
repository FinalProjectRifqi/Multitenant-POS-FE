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
import { DEFAULT_MENU_ITEM_FORM_VALUES } from "@/lib/menu/constants";
import {
  createMenuItemRequestSchema,
  type CreateMenuItemRequest,
  type MenuCategoryEntity,
} from "@/lib/schemas/menu";
import { cn } from "@/lib/utils";

type MenuFormDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: CreateMenuItemRequest;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateMenuItemRequest) => Promise<void>;
  /** Active categories for the currently selected unit */
  categories: MenuCategoryEntity[];
};

export function MenuFormDialog({
  title,
  description,
  submitLabel,
  open,
  onOpenChange,
  initialValues = DEFAULT_MENU_ITEM_FORM_VALUES,
  isPending,
  errorMessage,
  onSubmit,
  categories,
}: MenuFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMenuItemRequest>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- z.coerce.number() input type is `unknown`, causing a mismatch with the output type
    resolver: zodResolver(createMenuItemRequestSchema) as any,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) reset(initialValues);
  }, [initialValues, open, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset(DEFAULT_MENU_ITEM_FORM_VALUES);
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
      {/* Nama Menu */}
      <div className="space-y-2">
        <Label htmlFor="menu_item_name">Nama Menu</Label>
        <Input
          id="menu_item_name"
          placeholder="Masukkan nama menu"
          className={cn(
            "py-5",
            errors.menu_item_name &&
              "border-destructive focus-visible:ring-destructive",
          )}
          disabled={isPending}
          {...register("menu_item_name")}
        />
        {errors.menu_item_name && (
          <p className="text-xs text-destructive">
            {errors.menu_item_name.message}
          </p>
        )}
      </div>

      {/* Kategori Menu */}
      <div className="space-y-2">
        <Label htmlFor="menu_category_id">Kategori Menu</Label>
        <Controller
          control={control}
          name="menu_category_id"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isPending || categories.length === 0}
            >
              <SelectTrigger
                id="menu_category_id"
                className={cn(
                  "w-full bg-background py-5",
                  errors.menu_category_id &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              >
                <SelectValue placeholder="Pilih kategori menu" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.menu_category_id}
                    value={cat.menu_category_id}
                  >
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.menu_category_id && (
          <p className="text-xs text-destructive">
            {errors.menu_category_id.message}
          </p>
        )}
      </div>

      {/* Harga */}
      <div className="space-y-2">
        <Label htmlFor="item_price">Harga (Rp)</Label>
        <Input
          id="item_price"
          type="number"
          placeholder="Masukkan harga menu"
          className={cn(
            "py-5",
            errors.item_price &&
              "border-destructive focus-visible:ring-destructive",
          )}
          disabled={isPending}
          {...register("item_price", { valueAsNumber: true })}
        />
        {errors.item_price && (
          <p className="text-xs text-destructive">
            {errors.item_price.message}
          </p>
        )}
      </div>

      {/* URL Gambar */}
      <div className="space-y-2">
        <Label htmlFor="image_url">
          URL Gambar{" "}
          <span className="text-muted-foreground font-normal">(opsional)</span>
        </Label>
        <Input
          id="image_url"
          placeholder="https://contoh.com/gambar.jpg"
          className={cn(
            "py-5",
            errors.image_url &&
              "border-destructive focus-visible:ring-destructive",
          )}
          disabled={isPending}
          {...register("image_url")}
        />
        {errors.image_url && (
          <p className="text-xs text-destructive">
            {errors.image_url.message}
          </p>
        )}
      </div>

      {/* Ketersediaan */}
      <div className="space-y-2">
        <Label htmlFor="is_available">Status Ketersediaan</Label>
        <Controller
          control={control}
          name="is_available"
          render={({ field }) => (
            <Select
              value={field.value ? "true" : "false"}
              onValueChange={(v) => field.onChange(v === "true")}
              disabled={isPending}
            >
              <SelectTrigger
                id="is_available"
                className={cn(
                  "w-full bg-background py-5",
                  errors.is_available &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              >
                <SelectValue placeholder="Pilih status ketersediaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Tersedia</SelectItem>
                <SelectItem value="false">Tidak Tersedia</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.is_available && (
          <p className="text-xs text-destructive">
            {errors.is_available.message}
          </p>
        )}
      </div>
    </CrudFormDialog>
  );
}
