import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { auth } from "@/lib/nextauth/auth";
import {
  getDashboardRoute,
  ROLE_LABEL,
  type RoleCode,
} from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "403 Akses Ditolak — Multitenant XYZ POS",
};

export default async function ForbiddenPage() {
  const session = await auth();
  const roleCode = session?.user?.role_code as RoleCode | undefined;
  const roleLabel = roleCode ? (ROLE_LABEL[roleCode] ?? roleCode) : null;
  const dashboardPath = getDashboardRoute(roleCode ?? "");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            403 — Akses Ditolak
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {roleLabel ? (
              <>
                Kamu masuk sebagai{" "}
                <span className="font-medium text-foreground">{roleLabel}</span>
                . Role ini tidak memiliki izin untuk mengakses halaman yang
                diminta.
              </>
            ) : (
              "Kamu tidak memiliki izin untuk mengakses halaman ini."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          {session ? (
            <Button asChild>
              <Link href={dashboardPath}>Ke Dashboard Saya</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
