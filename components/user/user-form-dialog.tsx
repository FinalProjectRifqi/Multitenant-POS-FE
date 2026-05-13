"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { type Resolver, useForm, Controller } from "react-hook-form";

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
import { useRolesQuery } from "@/lib/queries/role";
import { useUnitsQuery } from "@/lib/queries/unit";
import {
  createUserRequestSchema,
  updateUserRequestSchema,
} from "@/lib/schemas/user";
import type { CreateUserRequest } from "@/lib/types/user";
import { DEFAULT_USER_FORM_VALUES } from "@/lib/user/constants";
import { cn } from "@/lib/utils";

type UserFormDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: CreateUserRequest;
  isPending: boolean;
  errorMessage?: string | null;
  requirePassword?: boolean;
  onSubmit: (values: CreateUserRequest) => Promise<void>;
};

export function UserFormDialog({
  title,
  description,
  submitLabel,
  open,
  onOpenChange,
  initialValues = DEFAULT_USER_FORM_VALUES,
  isPending,
  errorMessage,
  requirePassword = true,
  onSubmit,
}: UserFormDialogProps) {
  const { data: rolesResponse, isLoading: rolesLoading } = useRolesQuery();
  const { data: unitsResponse, isLoading: unitsLoading } = useUnitsQuery();
  const activeUnits = useMemo(
    () =>
      (unitsResponse?.data ?? []).filter((unit) => unit.business_unit_status),
    [unitsResponse],
  );

  const roles = rolesResponse?.data || [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    resolver: zodResolver(
      requirePassword ? createUserRequestSchema : updateUserRequestSchema,
    ) as unknown as Resolver<CreateUserRequest>,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) reset(initialValues);
  }, [initialValues, open, reset]);

  const onFormSubmit = handleSubmit(async (values) => {
    try {
      const payload = { ...values };
      if (!requirePassword) {
        delete (payload as Partial<CreateUserRequest>).password;
      }
      await onSubmit(payload);
      reset(DEFAULT_USER_FORM_VALUES);
    } catch {
      // Errors are handled by the mutation hooks.
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
      contentClassName="w-[min(92vw,560px)]"
      onSubmit={(event) => {
        void onFormSubmit(event);
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nama Lengkap</Label>
          <Input
            id="full_name"
            placeholder="Masukkan nama lengkap"
            className={cn("py-5", errors.full_name && "border-destructive")}
            disabled={isPending}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_name">Username</Label>
          <Input
            id="user_name"
            placeholder="Masukkan username"
            className={cn(
              "py-5",
              errors.user_name &&
                "border-destructive focus-visible:ring-destructive",
            )}
            disabled={isPending}
            {...register("user_name")}
          />
          {errors.user_name && (
            <p className="text-xs text-destructive">
              {errors.user_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@example.com"
          className={cn("py-5", errors.email && "border-destructive")}
          disabled={isPending}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <Label htmlFor="role_id">Role Pengguna</Label>
          <Controller
            control={control}
            name="role_id"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={isPending || rolesLoading}
              >
                <SelectTrigger
                  id="role_id"
                  className={cn("py-5", errors.role_id && "border-destructive")}
                >
                  <SelectValue placeholder="Pilih Role Pengguna" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role_id && (
            <p className="text-xs text-destructive">{errors.role_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_unit_id">Unit Usaha</Label>
          <Controller
            control={control}
            name="business_unit_id"
            render={({ field }) => (
              <Select
                onValueChange={(val) =>
                  field.onChange(val === "none" ? null : val)
                }
                defaultValue={field.value || "none"}
                value={field.value || "none"}
                disabled={isPending || unitsLoading}
              >
                <SelectTrigger
                  id="business_unit_id"
                  className={cn(
                    "py-5",
                    errors.business_unit_id && "border-destructive",
                  )}
                >
                  <SelectValue placeholder="Pilih Unit Usaha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Pilih Unit Usaha --</SelectItem>
                  {activeUnits.map((unit) => (
                    <SelectItem
                      key={unit.business_unit_id}
                      value={unit.business_unit_id}
                    >
                      {unit.business_unit_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.business_unit_id && (
            <p className="text-xs text-destructive">
              {errors.business_unit_id.message}
            </p>
          )}
        </div>
      </div>

      {requirePassword && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Masukkan password"
            className={cn("py-5", errors.password && "border-destructive")}
            disabled={isPending}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}
    </CrudFormDialog>
  );
}
