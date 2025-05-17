"use client"

import { useState, useEffect, use } from "react"
import { useWorkspace } from "@/hooks/useWorkspace"
import { useWorkspacePermissions } from "@/hooks/useWorkspacePermissions"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { ApiWorkspaceRole } from "@/types/workspace/ApiWorkspace"
import { UiWorkspaceMemberWithProfile } from "@/types/workspace/UiWorkspace"
import { InviteDialog } from "@/components/workspace/invite-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"

// Import the existing components to maintain functionality
import { MembersHeader } from "@/components/workspace/members/members-header"
import { MembersList } from "@/components/workspace/members/members-list"

interface WorkspaceParams {
  workspaceId: string
}

interface TeamSettingsProps {
  params: Promise<WorkspaceParams>
}

export default function TeamSettings({ params: paramsPromise }: TeamSettingsProps) {
  // Unwrap the params from the Promise
  const params = use(paramsPromise) as WorkspaceParams
  const { workspaceId } = params
  
  // Use the new workspace hooks
  const { currentWorkspace, getWorkspaceById } = useWorkspace()
  const { canManageMembers } = useWorkspacePermissions()
  
  // Get the current workspace if it's not already the current one
  const workspace = currentWorkspace?.id === workspaceId 
    ? currentWorkspace 
    : getWorkspaceById(workspaceId)
  
  // Filter and sort state
  const [filterRole, setFilterRole] = useState<ApiWorkspaceRole | null>(null)
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [canManage, setCanManage] = useState(false)

  // Get current user session and status
  const { supabase } = useAuth()
  
  // Use our workspaceMembers hook for member management
  const {
    members,
    isLoading,
    sortedMembers,
    getUserRole,
  } = useWorkspaceMembers(workspaceId)
  
  // Get the current user ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data.user?.id || null)
    }
    fetchUser()
  }, [supabase])
  
  // Check permissions when workspaceId changes
  useEffect(() => {
    const checkPermissions = async () => {
      if (workspaceId) {
        const canManage = await canManageMembers(workspaceId)
        setCanManage(canManage)
      }
    }
    
    checkPermissions()
  }, [workspaceId, canManageMembers])
  
  // Get current user role
  const [currentUserRole, setCurrentUserRole] = useState<ApiWorkspaceRole | undefined>(undefined)
  
  // Get current user role when user ID is available
  useEffect(() => {
    const getCurrentRole = async () => {
      if (workspaceId && currentUserId) {
        try {
          const role = await getUserRole(workspaceId)
          setCurrentUserRole(role as ApiWorkspaceRole)
        } catch (error) {
          console.error('Error getting user role:', error)
        }
      }
    }
    
    getCurrentRole()
  }, [workspaceId, currentUserId, getUserRole])
  
  // Filter members based on role and search query
  const filteredMembers = sortedMembers.filter((member: UiWorkspaceMemberWithProfile) => {
    // Role filter
    if (filterRole && member.role !== filterRole) {
      return false
    }
    
    // Search query filter (check name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const name = member.profile?.displayName?.toLowerCase() || ""
      return name.includes(query)
    }
    
    return true
  })
  
  // Check for errors
  const error = members.length === 0 && !isLoading ? new Error("No members found") : null

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Team Management</h1>
        {canManage && (
          <Button onClick={() => setShowInviteDialog(true)}>
            Invite Team Member
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : "An error occurred"}
              </AlertDescription>
            </Alert>
          )}
          
          <MembersHeader
            memberCount={sortedMembers.length}
            onFilterChange={(role: string | null) => setFilterRole(role as ApiWorkspaceRole | null)}
            onSortChange={setSortBy}
            onSortDirectionChange={setSortDirection}
            onSearchChange={setSearchQuery}
            currentFilter={filterRole}
            currentSort={sortBy}
            currentSortDirection={sortDirection}
            searchQuery={searchQuery}
          />
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-8 w-[120px]" />
                </div>
              ))}
            </div>
          ) : (
            <MembersList 
              workspaceId={workspaceId}
              members={filteredMembers}
              currentUserRole={currentUserRole} 
              currentUserId={currentUserId} 
            />
          )}
      </div>
      
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        currentWorkspace={workspace || null}
      />
    </div>
  )
}
