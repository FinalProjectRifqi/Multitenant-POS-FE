"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardRoute } from "@/lib/constants/roles";
import type { LoginFormValues } from "@/lib/schemas/auth";
import { toast } from "sonner";

/**
 * Validates that a callbackUrl is safe to redirect to:
 * - must be a relative path starting with "/"
 * - must NOT start with "//" (prevents open redirect to //evil.com)
 * - must NOT be the login page itself (prevents infinite loop)
 */
function isSafeCallbackUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return (
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.startsWith("/login") &&
    url.length <= 500
  );
}

/**
 * useLogin — encapsulates the full login lifecycle using NextAuth Credentials.
 *
 *   1. Calls `signIn("credentials")` → NextAuth calls our `authorize()` function
 *   2. On success: redirects to callbackUrl (if safe) or role dashboard
 *   3. On failure: shows a toast with the error message
 *
 * @param callbackUrl - Optional URL to redirect to after successful login.
 *   Pass the raw value from the URL search params; this hook validates it.
 */
export function useLogin(callbackUrl?: string) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(credentials: LoginFormValues) {
    setIsPending(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth returns "CredentialsSignin" for failed authorize()
        const message =
          result.error === "CredentialsSignin"
            ? "Username atau password salah. Silakan coba lagi."
            : result.error;

        setError(message);
        toast.error(message, {
          position: "top-right",
          richColors: true,
          duration: 3000,
        });
        return;
      }

      toast.success("Login berhasil!", {
        description: "Anda berhasil login ke sistem POS.",
        position: "top-right",
        richColors: true,
        duration: 3000,
      });

      // Redirect to callbackUrl if it's safe, otherwise to the role dashboard.
      if (isSafeCallbackUrl(callbackUrl)) {
        router.push(callbackUrl);
        return;
      }

      // Session updated — fetch role to determine the correct dashboard route.
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const roleCode: string = session?.user?.role_code ?? "";
      const route = getDashboardRoute(roleCode);
      router.push(route);
    } catch {
      const message = "Terjadi kesalahan. Silakan coba lagi.";
      setError(message);
      toast.error(message, {
        position: "top-right",
        richColors: true,
        duration: 3000,
      });
    } finally {
      setIsPending(false);
    }
  }

  return {
    login,
    isPending,
    error,
    isError: error !== null,
  };
}
