"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { CrudFormDialog } from "@/components/shared/crud-form-dialog";
import { Button } from "@/components/ui/button";
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
  createMenuRequestSchema,
  type CreateMenuRequest,
} from "@/lib/schemas/menu";
import { cn } from "@/lib/utils";
import { useMenuCategoriesQuery } from "@/lib/queries/menu-categories";

type MenuFormDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: CreateMenuRequest;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CreateMenuRequest) => Promise<void>;
  /** The business unit id to fetch categories */
  businessUnitId: string;
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
  businessUnitId,
}: MenuFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: menuCategoriesResponse, isLoading: menuCategoriesLoading } =
    useMenuCategoriesQuery({ business_unit_id: businessUnitId });
  const menuCategories = menuCategoriesResponse?.data || [];

  /**
   * imagePreview: object URL for newly selected file, or the existing URL from
   * API (passed via initialValues.menu_image as string) for edit mode display.
   */
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  /** selectedFile: the File object the user picked — only this gets uploaded. */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateMenuRequest>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createMenuRequestSchema) as any,
    defaultValues: initialValues,
  });

  // Sync form + image state when dialog opens / initialValues change
  useEffect(() => {
    if (open) {
      reset(initialValues);
      setSelectedFile(null);
      // For edit mode, show the existing image URL as a preview
      const existingUrl =
        typeof initialValues?.menu_image === "string" &&
        initialValues.menu_image.startsWith("http")
          ? initialValues.menu_image
          : null;
      setImagePreview(existingUrl);
    }
  }, [initialValues, open, reset]);

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // Replace any previous object URL
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Inject the File into react-hook-form so it reaches the submit handler
    setValue("menu_image", file);
  }

  function handleClearImage() {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);
    setValue("menu_image", undefined);
    // Reset the native file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const onFormSubmit = handleSubmit(async (values) => {
    try {
      // Inject the selected File (or leave undefined to keep existing image)
      await onSubmit({ ...values, menu_image: selectedFile ?? undefined });
      reset(DEFAULT_MENU_ITEM_FORM_VALUES);
      setSelectedFile(null);
      setImagePreview(null);
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
        <Label htmlFor="menu_name">Nama Menu</Label>
        <Input
          id="menu_name"
          placeholder="Masukkan nama menu"
          className={cn(
            "py-5",
            errors.menu_name &&
              "border-destructive focus-visible:ring-destructive",
          )}
          disabled={isPending}
          {...register("menu_name")}
        />
        {errors.menu_name && (
          <p className="text-xs text-destructive">{errors.menu_name.message}</p>
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
              disabled={isPending || menuCategoriesLoading}
            >
              <SelectTrigger
                id="menu_category_id"
                className={cn(
                  "w-full bg-background py-5",
                  errors.menu_category_id &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              >
                <SelectValue
                  placeholder={
                    menuCategories.length === 0
                      ? "Belum ada kategori tersedia"
                      : "Pilih kategori menu"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {menuCategories.map((menuCategory) => (
                  <SelectItem
                    key={menuCategory.menu_category_id}
                    value={menuCategory.menu_category_id}
                  >
                    {menuCategory.menu_category_name}
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

      {/* Gambar Menu — file upload */}
      <div className="space-y-2">
        <Label>
          Gambar Menu{" "}
          <span className="text-muted-foreground font-normal">(opsional)</span>
        </Label>

        {/*
         * Single unified zone: preview lives INSIDE the dashed border.
         * Empty state → icon + text. Preview state → image fills the box.
         */}
        <label
          htmlFor="menu_image_file"
          className={cn(
            "relative flex w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors",
            !isPending && "hover:border-primary/50",
            isPending && "cursor-not-allowed opacity-50",
          )}
        >
          {imagePreview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview gambar menu"
                className="h-48 w-full object-contain bg-muted"
                onError={() => setImagePreview(null)}
              />
              {/* Remove Button overlay */}
              <Button
                type="Button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full shadow-md"
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  handleClearImage();
                }}
                aria-label="Hapus gambar"
              >
                <X className="size-3.5" />
              </Button>
              {/* Bottom info strip */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-background/80 px-3 py-1.5 backdrop-blur-sm">
                <p className="truncate text-xs text-muted-foreground">
                  {selectedFile
                    ? selectedFile.name
                    : "Gambar saat ini — klik untuk ganti"}
                </p>
                <span className="shrink-0 text-xs font-medium text-primary">
                  Ganti
                </span>
              </div>
            </>
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-1.5 py-8">
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Upload gambar
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG, WEBP hingga 5 MB
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            id="menu_image_file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            disabled={isPending}
            onChange={handleFileChange}
          />
        </label>
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
