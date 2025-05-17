"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkspaceIndexPage() {
  const router = useRouter();
  const { workspaces, isWorkspaceLoading } = useWorkspace();
  
  // Redirect to the first workspace or create a new one if no workspaces
  useEffect(() => {
    // Only attempt to redirect once data is loaded
    if (!isWorkspaceLoading()) {
      // Small delay to ensure state is properly initialized
      const redirectTimer = setTimeout(() => {
        if (workspaces && workspaces.length > 0) {
          // Redirect to the first workspace
          router.replace(`/dashboard/workspace/${workspaces[0].id}`);
        } else {
          // If there are no workspaces, redirect to dashboard
          // The workspace provider will handle creating a default workspace
          router.replace('/dashboard');
        }
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [workspaces, isWorkspaceLoading, router]);

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className={cn(
          "animate-spin text-primary w-10 h-10 mx-auto mb-4"
        )} />
        <p className="text-muted-foreground">Loading workspace...</p>
      </div>
    </div>
  );
}
