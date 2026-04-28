"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardRoute } from "@/lib/constants/roles";
import type { LoginFormValues } from "@/lib/schemas/auth";
import { toast } from "sonner";

/**
 * useLogin — encapsulates the full login lifecycle using NextAuth Credentials.
 *
 *   1. Calls `signIn("credentials")` → NextAuth calls our `authorize()` function
 *   2. On success: reads the role from the session, redirects to the role dashboard
 *   3. On failure: shows a toast with the error message
 *
 * Using `redirect: false` so we handle the redirect ourselves (role-based routing).
 */
export function useLogin() {
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

      // Session updated — fetch the role from the new session to route correctly.
      // We re-fetch /api/auth/session (NextAuth endpoint) to read the JWT claims.
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const roleCode: string = session?.user?.role_code ?? "";
      const route = getDashboardRoute(roleCode);

      toast.success("Login berhasil!", {
        description: "Anda berhasil login ke sistem POS.",
        position: "top-right",
        richColors: true,
        duration: 3000,
      });

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
