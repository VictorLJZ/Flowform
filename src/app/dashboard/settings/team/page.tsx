"use client"

import { useState } from "react"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { WorkspaceRole } from "@/types/workspace-types"
import { InviteDialog } from "@/components/workspace/invite-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

// Import the existing components to maintain functionality
import { MembersHeader } from "@/components/workspace/members/members-header"
import { MembersList } from "@/components/workspace/members/members-list"

export default function TeamSettings() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore()
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId)
  
  // Debug logging to see what we're working with
  console.log('[TeamSettings] Workspace context:', {
    currentWorkspaceId: currentWorkspaceId || 'null',
    workspacesCount: workspaces.length,
    hasCurrentWorkspace: !!currentWorkspace,
  })
  
  const [filterRole, setFilterRole] = useState<WorkspaceRole | null>(null)
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  
  const {
    members,
    isLoading,
    error,
    isCurrentUserAdmin,
  } = useWorkspaceMembers(currentWorkspaceId)
  
  // Filter members based on role and search query
  const filteredMembers = members.filter(member => {
    // Role filter
    if (filterRole && member.role !== filterRole) {
      return false
    }
    
    // Search query filter (check name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const name = member.profile?.full_name?.toLowerCase() || ""
      return name.includes(query)
    }
    
    return true
  })
  
  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let valueA, valueB
    
    switch (sortBy) {
      case "name":
        valueA = a.profile?.full_name?.toLowerCase() || ""
        valueB = b.profile?.full_name?.toLowerCase() || ""
        break
      case "role":
        valueA = a.role as string
        valueB = b.role as string
        break
      case "joined":
        valueA = a.joined_at
        valueB = b.joined_at
        break
      default:
        valueA = a.profile?.full_name?.toLowerCase() || ""
        valueB = b.profile?.full_name?.toLowerCase() || ""
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
        {isCurrentUserAdmin() && (
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
            onFilterChange={(role: string | null) => setFilterRole(role as WorkspaceRole | null)}
            onSortChange={setSortBy}
            onSortDirectionChange={setSortDirection}
            onSearchChange={setSearchQuery}
            onInviteClick={() => setShowInviteDialog(true)}
            isAdmin={isCurrentUserAdmin()}
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
              members={sortedMembers}
              isCurrentUserAdmin={isCurrentUserAdmin()}
              currentUserId={null} // Will be filled in component
            />
          )}
      </div>
      
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        currentWorkspace={currentWorkspace}
      />
    </div>
  )
}
