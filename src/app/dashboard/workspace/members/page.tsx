"use client"

import { useState } from "react"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { WorkspaceRole } from "@/types/workspace-types"
import { MembersHeader } from "@/app/dashboard/workspace/members/components/members-header"
import { MembersList } from "@/app/dashboard/workspace/members/components/members-list"
import { InviteDialog } from "@/components/workspace/invite-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function WorkspaceMembersPage() {
  const { currentWorkspaceId, workspaces } = useWorkspaceStore()
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId)
  
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
      // We don't have direct access to email, but could add if needed
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/workspace">
                    Workspace
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate font-medium">
                    Members
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h1 className="text-2xl font-semibold">{currentWorkspace?.name || "Workspace"} Members</h1>
          </div>

          <p className="text-muted-foreground mb-6">Manage workspace members and their permissions</p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
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
            <div className="space-y-4 mt-6">
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
      </div>
      
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        currentWorkspace={currentWorkspace}
      />
    </>
  )
}
