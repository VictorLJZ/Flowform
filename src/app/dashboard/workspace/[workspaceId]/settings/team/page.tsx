"use client"

import { useState } from "react"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { ApiWorkspaceRole } from "@/types/workspace"
import { UiWorkspaceMemberWithProfile } from "@/types/workspace"
import { apiToUiWorkspaceMemberWithProfile } from "@/utils/type-utils/workspace/ApiToUiWorkspace"
import { InviteDialog } from "@/components/workspace/invite-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAuthSession } from "@/hooks/useAuthSession"
import { useCurrentWorkspace } from "@/providers/workspace-provider"

// Import the existing components to maintain functionality
import { MembersHeader } from "@/components/workspace/members/members-header"
import { MembersList } from "@/components/workspace/members/members-list"

export default function TeamSettings() {
  // Get the current workspace from our provider
  const { currentWorkspace, selectedId: currentWorkspaceId } = useCurrentWorkspace()
  
  // Debug logging to see what we're working with
  console.log('[TeamSettings] Workspace context:', {
    currentWorkspaceId: currentWorkspaceId || 'null', 
    hasCurrentWorkspace: !!currentWorkspace,
  })
  
  const [filterRole, setFilterRole] = useState<ApiWorkspaceRole | null>(null)
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  // Get current user's ID for sorting
  const { user: currentUser } = useAuthSession()
  const currentUserId = currentUser?.id
  
  const {
    members,
    isLoading,
    error,
  } = useWorkspaceMembers(currentWorkspaceId)
  
  // Find current user's role
  const currentUserRole = members?.find(m => m.userId === currentUserId)?.role as ApiWorkspaceRole | undefined;
  
  // Filter members based on role and search query
  const filteredMembers = members.filter(member => {
    // Role filter
    if (filterRole && member.role !== filterRole) {
      return false
    }
    
    // Search query filter (check name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const name = member.profile?.fullName?.toLowerCase() || ""
      return name.includes(query)
    }
    
    return true
  })
  
  // Transform members from API to UI type
  const uiMembers = filteredMembers.map(member => {
    // Mark if this is the current user
    const isCurrentUser = member.userId === currentUserId;
    return apiToUiWorkspaceMemberWithProfile(member, isCurrentUser);
  });

  // Sort members
  const sortedMembers = [...uiMembers].sort((a, b) => {
    // Prioritize the current user
    if (currentUserId) {
      if (a.userId === currentUserId) return -1 // Current user 'a' comes first
      if (b.userId === currentUserId) return 1  // Current user 'b' comes first (so 'a' comes after)
    }
    
    // Existing sorting logic for other members
    let valueA, valueB
    
    switch (sortBy) {
      case "name":
        valueA = a.profile?.fullName?.toLowerCase() || ""
        valueB = b.profile?.fullName?.toLowerCase() || ""
        break
      case "role":
        valueA = a.role as string
        valueB = b.role as string
        break
      case "joined":
        valueA = a.joinedAt
        valueB = b.joinedAt
        break
      default:
        valueA = a.profile?.fullName?.toLowerCase() || ""
        valueB = b.profile?.fullName?.toLowerCase() || ""
    }
    
    // Handle sorting direction
    const sortFactor = sortDirection === "asc" ? 1 : -1
    
    if (valueA < valueB) return -1 * sortFactor
    if (valueA > valueB) return 1 * sortFactor
    return 0
  })
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Team Management</h1>
        {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
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
            onInviteClick={() => setShowInviteDialog(true)}
            isAdmin={currentUserRole === 'admin'}
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
              members={sortedMembers as UiWorkspaceMemberWithProfile[]}
              currentUserRole={currentUserRole} 
              currentUserId={currentUserId} 
            />
          )}
      </div>
      
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        currentWorkspace={currentWorkspace || null}
      />
    </div>
  )
}
