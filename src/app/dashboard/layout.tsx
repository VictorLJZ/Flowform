"use client";
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DebugProvider } from "@/components/providers/debug-provider";
import { ProtectedRoute } from "@/components/providers/protected-route";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import MediaEditorProvider from "@/components/media/MediaEditorProvider";

// Workspace initialization now handled by WorkspaceProvider

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DebugProvider>
      {/* Protect all dashboard routes by wrapping with ProtectedRoute */}
      <ProtectedRoute redirectTo="/">
        <WorkspaceProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <main className="flex-1 w-full overflow-auto">
                {children}
              </main>
              <MediaEditorProvider />
            </div>
          </SidebarProvider>
        </WorkspaceProvider>
      </ProtectedRoute>
    </DebugProvider>
  );
}
