import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
          <main className="flex-1 overflow-hidden h-full bg-[#F1EEE9]">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserProvider>
  );
}
