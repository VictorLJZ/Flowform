"use client"

import { useEffect, useState } from "react"
import { checkAuthStatus } from "@/lib/debug/authCheck"
import { useRouter } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BarChart3, FileText, PlusCircle, Users, AlertCircle, MoreHorizontal, Edit, LogOut, Trash2 } from "lucide-react"
import { useDashboardData } from "@/hooks/useDashboardData"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { RenameDialog } from "@/components/workspace/rename-dialog"
import { ConfirmDialog } from "@/components/workspace/confirm-dialog"
import { InviteDialog } from "@/components/workspace/invite-dialog"
import { RecentActivity, DashboardFormData } from "@/types/dashboard-types"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { useAuthSession } from "@/hooks/useAuthSession"
import { WorkspaceRole } from "@/types/workspace-types"

export default function Page() {
  const router = useRouter()
  // Get workspace ID, converting null to undefined for hooks
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId) ?? undefined;
  const { dashboardData, isLoading, error, mutate } = useDashboardData(currentWorkspaceId)
  const stats = dashboardData?.stats
  const recentActivity = dashboardData?.recentActivity || []
  const recentForms = dashboardData?.recentForms || []
  
  // Get current user for role check
  const { user: currentUser } = useAuthSession()
  const currentUserId = currentUser?.id
  
  // Fetch members to determine current user's role
  const { members: workspaceMembers } = useWorkspaceMembers(currentWorkspaceId)
  const currentUserRole = workspaceMembers?.find(m => m.user_id === currentUserId)?.role as WorkspaceRole | undefined

  const { workspace, rename, leave, remove } = useCurrentWorkspace(currentWorkspaceId)

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

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
    // Only run in development and only once per session
    if (process.env.NODE_ENV !== 'development') return;
    if (sessionStorage.getItem('auth_checked')) return;
    
    const runAuthCheck = async () => {
      try {
        const result = await checkAuthStatus();
        console.log('[Dashboard] Auth check:', result);
        sessionStorage.setItem('auth_checked', 'true');
      } catch (error) {
        console.error('[Dashboard] Auth check error:', error);
      }
    };
    
    // Run the check after a short delay to ensure page is stable
    const timer = setTimeout(runAuthCheck, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateForm = () => { router.push('/dashboard/builder/new') }
  const handleViewResponses = (formId: string) => { router.push(`/dashboard/forms/${formId}/responses`) }
  const handleRenameWorkspace = () => { setIsRenameDialogOpen(true) }
  const handleLeaveWorkspace = () => { setIsLeaveDialogOpen(true) }
  const handleDeleteWorkspace = () => { setIsDeleteDialogOpen(true) }
  const handleInviteToWorkspace = () => { setIsInviteDialogOpen(true) }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <header className="relative flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate font-medium">
                    {isLoading ? <Skeleton className="h-5 w-32" /> : workspace?.name || "Dashboard"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Workspace Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {workspace ? (
                <>
                  <DropdownMenuItem onClick={handleRenameWorkspace}><Edit className="mr-2 h-4 w-4" /> Rename</DropdownMenuItem>
                  {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                    <DropdownMenuItem onClick={handleInviteToWorkspace}><Users className="mr-2 h-4 w-4" /> Invite Members</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLeaveWorkspace} className="text-destructive focus:text-destructive focus:bg-destructive/10"><LogOut className="mr-2 h-4 w-4" /> Leave Workspace</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteWorkspace} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete Workspace</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled>Loading settings...</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-sm border">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-16 h-16 text-destructive mb-4" />
              <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
              <p className="text-muted-foreground">{error?.message || 'An unknown error occurred'}</p> {/* Display error message */}
              <Button 
                onClick={() => mutate()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Stats Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center"> {/* Safely access stats */}
                    <p className="text-3xl font-bold">{stats?.totalForms ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Total Forms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats?.totalResponses ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Total Responses</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-3xl font-bold">ONE TRILLION</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                {(recentActivity?.length ?? 0) > 0 ? ( // Check length safely
                  <div className="space-y-4">
                    {(recentActivity ?? []).map((activity: RecentActivity) => ( // Map over safely, defaulting to []
                      <div key={activity.id} className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New response submitted</p>
                          <p className="text-xs text-muted-foreground">
                            For: {activity.form_title} - {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewResponses(activity.form_id)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Recent Forms</h2>
                {(recentForms?.length ?? 0) > 0 ? ( // Check length safely
                  <div className="space-y-3">
                    {(recentForms ?? []).map((form: DashboardFormData) => ( // Map over safely, defaulting to []
                      <div key={form.form_id} className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="cursor-pointer hover:text-primary" onClick={() => handleViewResponses(form.form_id)}>
                          {form.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No forms yet</p>
                  </div>
                )}
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button 
                    className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors"
                    onClick={handleCreateForm}
                  >
                    <PlusCircle className="h-4 w-4" /> New Form
                  </button>
                  {(recentForms?.length ?? 0) > 0 && ( // Check length safely
                    <button 
                      className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors"
                      onClick={() => handleViewResponses(recentForms?.[0]?.form_id ?? '')} // Access safely
                    >
                      <FileText className="h-4 w-4" /> View Latest Responses
                    </button>
                  )}
                  <button className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded-md transition-colors">
                    <Users className="h-4 w-4" /> Team Sharing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <RenameDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        workspace={workspace ?? null}
        onRename={async (_id, newName) => { await rename(newName) }}
      />
      
      <ConfirmDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        title="Leave Workspace"
        description={`Are you sure you want to leave the "${workspace?.name || 'this'}" workspace? You will no longer have access to this workspace's forms and data.`}
        confirmLabel="Leave Workspace"
        onConfirm={async () => { await leave() }}
      />
      
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Workspace"
        description={`Are you sure you want to delete the "${workspace?.name || 'this'}" workspace? This action cannot be undone and all forms and data will be permanently lost.`}
        confirmLabel="Delete Workspace"
        variant="destructive"
        onConfirm={async () => { 
          await remove(); 
          // Optionally, clear SWR cache or navigate away if needed after deletion 
        }}
      />
      
      {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
        <InviteDialog 
          open={isInviteDialogOpen} 
          onOpenChange={setIsInviteDialogOpen}
          currentWorkspace={workspace} // Pass the workspace object
        />
      )}
    </>
  )
}
