"use client";

import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useWorkspaceInit } from "@/hooks/useWorkspaceInit";
import { DebugProvider } from "@/components/providers/debug-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize workspace for authenticated users
  const { isInitializing } = useWorkspaceInit();
  return (
    <DebugProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 w-full overflow-auto">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </DebugProvider>
  );
}
