import React from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { SessionExpiryWatcher } from "@/components/dashboard/session-expiry-watcher";
import { CurrentUserProvider } from "@/components/dashboard/current-user-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrentUserProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SessionExpiryWatcher />
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-[#F1EEE9]/95 px-4 backdrop-blur md:hidden">
            <SidebarTrigger className="size-9 rounded-lg border border-border bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground" />
            <div className="min-w-0 leading-tight">
              <p className="truncate sm:text-xl text-sm font-bold text-foreground">
                Sistem POS XYZ
              </p>
            </div>
          </header>
          <main className="flex-1 overflow-hidden h-full bg-[#F1EEE9]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserProvider>
  );
}
