import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Masuk — Multitenant XYZ POS",
  description:
    "Masuk ke sistem POS multi-tenant XYZ Group untuk mengelola pesanan, dapur, dan laporan unit.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/90 flex-col justify-between p-12 relative overflow-hidden">
        
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute top-20 -right-20 w-72 h-72 rounded-full bg-primary-foreground/5 blur-2xl" />

        
        <div className="relative flex items-center gap-3">
         
          <span className="text-primary-foreground font-semibold tracking-tight text-lg">
            XYZ Group
          </span>
        </div>

        <div className="relative space-y-4">
          <div className="w-10 h-0.5 bg-secondary" />
          <h1 className="text-primary-foreground text-4xl font-bold leading-tight tracking-tight">
            Point of Sales
            <br />
            <span className="text-primary-foreground/80">Multi-Tenant</span>
          </h1>
          <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-xs">
            Kelola pesanan, dapur, dan laporan seluruh unit bisnis Anda dari
            satu platform terpadu.
          </p>
        </div>

        
        <p className="relative text-primary-foreground/40 text-xs">
          © {new Date().getFullYear()} XYZ Group. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-card flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
         
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">XYZ Group POS</span>
          </div>

          
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access your POS dashboard
            </p>
          </div>

          {/* Form card */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-8">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Having trouble? Contact your manager or admin.
          </p>
        </div>
      </div>
    </main>
  );
}