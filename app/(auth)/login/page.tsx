import type { Metadata } from "next";
import { UtensilsCrossed } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk — Multitenant XYZ POS",
  description:
    "Masuk ke sistem POS multi-tenant XYZ Group untuk mengelola pesanan, dapur, dan laporan unit.",
};

const DEMO_ACCOUNTS = [
  { role: "Staf Unit", email: "staf@xyz.id" },
  { role: "Tim Dapur", email: "dapur@xyz.id" },
  { role: "Manajer Unit", email: "manajer@xyz.id" },
  { role: "Manajemen Grup", email: "grup@xyz.id" },
] as const;

export default function LoginPage() {
  const isDummy = process.env.NEXT_PUBLIC_AUTH_MODE !== "real";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* ── Decorative background ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Warm burgundy blob top-left */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/[0.06] blur-3xl" />
        {/* Warm cream blob bottom-right */}
        <div className="absolute -right-32 -bottom-32 h-[420px] w-[420px] rounded-full bg-primary/[0.09] blur-3xl" />
        {/* Subtle center wash */}
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/50 blur-3xl" />
        {/* Fine grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.276 0.104 13.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.276 0.104 13.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-8">
        {/* ── Brand header ── */}
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/25 transition-transform hover:scale-105">
            <UtensilsCrossed
              className="h-7 w-7 text-primary-foreground"
              strokeWidth={1.8}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Multitenant XYZ POS
            </h1>
          </div>
        </header>

        {/* ── Login card ── */}
        <Card className="w-full border-border/50 bg-card/70 shadow-2xl shadow-foreground/[0.04] backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-semibold">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account to access the POS system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LoginForm />
          </CardContent>

          <CardFooter className="justify-center border-t-0 bg-transparent pt-0 pb-5">
            <p className="text-xs text-muted-foreground">
              For support, contact your manager or admin
            </p>
          </CardFooter>
        </Card>

        {/* ── Demo credentials (hidden when real API is active) ── */}
        {isDummy && (
          <Card className="w-full border-primary/15 bg-primary/[0.03]" size="sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                Demo Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {DEMO_ACCOUNTS.map(({ role, email }) => (
                  <div key={email}>
                    <span className="font-medium text-foreground/70">
                      {role}:
                    </span>{" "}
                    <span className="font-mono text-[11px]">{email}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                Password: <code className="font-mono">password</code>
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} XYZ Group. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
