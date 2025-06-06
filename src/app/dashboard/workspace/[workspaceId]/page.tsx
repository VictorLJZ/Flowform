"use client";

import { useEffect, useState } from "react";
import { checkAuthStatus } from "@/lib/debug/authCheck";
import { useRouter, useParams } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWorkspacePermissions } from "@/hooks/useWorkspacePermissions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, Edit, LogOut, Trash2, MoreHorizontal, Grid, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { RenameDialog } from "@/components/workspace/rename-dialog";
import { ConfirmDialog } from "@/components/workspace/confirm-dialog";
import { InviteDialog } from "@/components/workspace/invite-dialog";
import { useAuth } from "@/providers/auth-provider";
import { ApiWorkspaceRole } from "@/types/workspace/ApiWorkspace";
import { FormsView } from "@/components/dashboard";

export default function WorkspacePage() {
  const router = useRouter();
  
  // Get current workspace and operations from our unified hooks
  const { 
    getWorkspaceById,
    updateWorkspaceSettings,
    deleteWorkspace,
    leaveWorkspace 
  } = useWorkspace();
  
  // Extract workspaceId from the URL
  const { workspaceId } = useParams();
  
  // Get the current workspace
  const currentWorkspace = getWorkspaceById(workspaceId as string);
  
  // Get current user
  const { supabase } = useAuth();
  // Use a proper type for Supabase user - only care about ID
  interface UserWithId { id: string }
  const [currentUser, setCurrentUser] = useState<UserWithId | null>(null);
  
  // Get permissions and member info
  const { getUserRole } = useWorkspacePermissions();
  
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser({ id: data.user.id });
      } else {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, [supabase]);
  
  const currentUserId = currentUser?.id;
  const [currentUserRole, setCurrentUserRole] = useState<ApiWorkspaceRole | undefined>();
  
  // Get user role
  useEffect(() => {
    if (workspaceId && currentUserId) {
      getUserRole(workspaceId as string).then(role => {
        setCurrentUserRole(role as ApiWorkspaceRole);
      });
    }
  }, [workspaceId, currentUserId, getUserRole]);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  // View mode state for forms display
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // First effect: Prevent reload loops and handle cleanup
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log('[Dashboard] Mounted');
    
    if (typeof window !== 'undefined') {
      // Clear navigation flags once we've reached the dashboard
      sessionStorage.removeItem('redirect_source');
      sessionStorage.removeItem('redirect_in_progress');
      
      // Set dashboard flag with timestamp to track time spent on dashboard
      const timestamp = Date.now().toString();
      sessionStorage.setItem('dashboard_loaded', timestamp);
      
      // Increment mount count for debugging
      if (isDev) {
        const count = parseInt(sessionStorage.getItem('dashboard_mounts') || '0') + 1;
        sessionStorage.setItem('dashboard_mounts', count.toString());
        console.log(`[Dashboard] Mount count: ${count}`);
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // Only clear dashboard flag if we've been on the page long enough
        // to prevent rapid mount/unmount cycles
        const loadTime = parseInt(sessionStorage.getItem('dashboard_loaded') || '0');
        if (Date.now() - loadTime > 1000) {
          sessionStorage.removeItem('dashboard_loaded');
        }
      }
    };
  }, []);

  // Second effect: Auth diagnostics (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log the auth status for debugging
      runAuthCheck();
    }
  }, []);

  // A diagnostic function to monitor auth status in local development
  const runAuthCheck = async () => {
    if (process.env.NODE_ENV !== 'development') return;
    try {
      await checkAuthStatus();
    } catch (error) {
      console.error('[Dashboard] Auth diagnostic check failed:', error);
    }
  };

  // Dialog handlers
  const handleRenameWorkspace = () => setIsRenameDialogOpen(true);
  const handleLeaveWorkspace = () => setIsLeaveDialogOpen(true);
  const handleDeleteWorkspace = () => setIsDeleteDialogOpen(true);
  const handleInviteToWorkspace = () => setIsInviteDialogOpen(true);
  
  // Action handlers
  const rename = async (newName: string) => {
    if (workspaceId) {
      await updateWorkspaceSettings(workspaceId as string, { name: newName });
    }
  };
  
  const leave = async () => {
    if (workspaceId) {
      await leaveWorkspace(workspaceId as string);
      router.push('/dashboard/workspace');
    }
  };
  
  const remove = async () => {
    if (workspaceId) {
      await deleteWorkspace(workspaceId as string);
      router.push('/dashboard/workspace');
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col w-full">
        <header className="relative flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 w-full">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentWorkspace?.name || "Workspace"}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={() => router.push(`/dashboard/workspace/${workspaceId}/settings`)}
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {/* Custom heading with workspace name and rename button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold">{currentWorkspace?.name || "My Workspace"}</h1>
              {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Workspace Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleRenameWorkspace}><Edit className="mr-2 h-4 w-4" /> Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleInviteToWorkspace}><Users className="mr-2 h-4 w-4" /> Invite Members</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLeaveWorkspace} className="text-destructive focus:text-destructive focus:bg-destructive/10"><LogOut className="mr-2 h-4 w-4" /> Leave Workspace</DropdownMenuItem>
                    {(currentUserRole === 'owner') && (
                      <DropdownMenuItem onClick={handleDeleteWorkspace} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete Workspace</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* View mode controls */}
            <div className="flex items-center space-x-2">
              <div className="border rounded-md overflow-hidden flex">
                <Button 
                  variant={viewMode === 'grid' ? "default" : "ghost"} 
                  size="sm" 
                  className="rounded-none px-3 h-9" 
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? "default" : "ghost"} 
                  size="sm" 
                  className="rounded-none px-3 h-9" 
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Divider between header and content */}
          <Separator className="mb-6" />
          
          {/* Integrated FormsView component */}
          <FormsView workspaceId={workspaceId as string} viewMode={viewMode} />
        </div>
      </div>
      
      {/* Rename/Invite only for Owner/Admin */}
      {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
        <>
          <RenameDialog
            open={isRenameDialogOpen}
            onOpenChange={setIsRenameDialogOpen}
            workspace={currentWorkspace ?? null}
            onRename={async (_id, newName) => { await rename(newName); }}
          />
          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete Workspace"
            description={`Are you sure you want to delete the "${currentWorkspace?.name || 'this'}" workspace? This action cannot be undone and all forms and data will be permanently lost.`}
            confirmLabel="Delete Workspace"
            variant="destructive"
            onConfirm={async () => { 
              await remove(); 
            }}
          />
          <InviteDialog 
            open={isInviteDialogOpen} 
            onOpenChange={setIsInviteDialogOpen}
            currentWorkspace={currentWorkspace} // Pass the workspace object
          />
        </>
      )}
      
      {/* Leave dialog - always available */}
      <ConfirmDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        title="Leave Workspace"
        description={`Are you sure you want to leave the "${currentWorkspace?.name || 'this'}" workspace? You will no longer have access to this workspace's forms and data.`}
        confirmLabel="Leave Workspace"
        onConfirm={async () => { await leave(); }}
      />
    </>
  );
}
