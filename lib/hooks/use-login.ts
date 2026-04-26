"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { getDashboardRoute } from "@/lib/constants/roles";
import { getErrorMessage } from "@/lib/api/client";
import type { LoginRequest } from "@/lib/types/auth";

/**
 * useLogin — encapsulates the full login mutation lifecycle:
 *   1. Calls auth service (dummy or real based on env)
 *   2. Resolves the role-based dashboard route
 *   3. Redirects the user
 *
 * The consuming form never imports auth service or router directly
 * (Dependency Inversion Principle).
 */
export function useLogin() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      const roleCode = data.user.role?.role_code ?? "";
      const route = getDashboardRoute(roleCode);
      router.push(route);
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
    isError: mutation.isError,
  };
}
