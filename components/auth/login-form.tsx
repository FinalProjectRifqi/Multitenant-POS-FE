"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLogin } from "@/lib/hooks/use-login";
import { loginRequestSchema, type LoginFormValues } from "@/lib/schemas/auth";

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const { login, isPending } = useLogin(callbackUrl);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit((data) => login(data))}
    >
      <div className="grid gap-1.5">
        <Label
          htmlFor="username"
          className="text-foreground text-sm font-medium"
        >
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Masukkan Username Anda"
          className={`rounded-lg py-5 px-3 bg-background border-input focus-visible:ring-2 ${
            errors.username
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }`}
          disabled={isPending}
          {...register("username")}
        />
        {errors.username && (
          <span className="text-xs text-destructive">
            {errors.username.message}
          </span>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label
          htmlFor="password"
          className="text-foreground text-sm font-medium"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`rounded-lg py-5 px-3 pr-10 bg-background border-input focus-visible:ring-2 ${
              errors.password
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
            disabled={isPending}
            {...register("password")}
          />
          <Button
            type="Button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            disabled={isPending}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <span className="text-xs text-destructive">
            {errors.password.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        className="w-full py-5 mt-1 text-sm font-semibold rounded-lg cursor-pointer transition-colors"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  );
}
