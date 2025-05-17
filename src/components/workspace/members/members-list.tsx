"use client"

import { useAuth } from "@/providers/auth-provider"
import { useWorkspace } from "@/hooks/useWorkspace"
import { useWorkspacePermissions } from "@/hooks/useWorkspacePermissions"
import { UiWorkspaceMemberWithProfile } from "@/types/workspace/UiWorkspace"
import { ApiWorkspaceRole } from "@/types/workspace/ApiWorkspace"
import { MemberItem } from "@/components/workspace/members/member-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"

interface MembersListProps {
  workspaceId: string
  members?: UiWorkspaceMemberWithProfile[]
  currentUserRole?: ApiWorkspaceRole
  currentUserId?: string | null
}

export function MembersList({ 
  workspaceId,
  members: propMembers, 
  currentUserRole: propCurrentUserRole, 
  currentUserId: propUserId 
}: MembersListProps) {
  const { supabase } = useAuth()
  const { members: allMembers, fetchMembers } = useWorkspace()
  const { getUserRole } = useWorkspacePermissions()
  
  const [members, setMembers] = useState<UiWorkspaceMemberWithProfile[]>(propMembers || [])
  const [currentUserRole, setCurrentUserRole] = useState<ApiWorkspaceRole | undefined>(propCurrentUserRole)
  const [currentUserId, setCurrentUserId] = useState<string | null>(propUserId || null)
  const [isLoading, setIsLoading] = useState(!propMembers)
  
  // Fetch members if not provided as props
  useEffect(() => {
    const loadData = async () => {
      if (!propMembers) {
        setIsLoading(true)
        await fetchMembers(workspaceId)
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [workspaceId, propMembers, fetchMembers])
  
  // Update members from store when changed
  useEffect(() => {
    if (propMembers) {
      setMembers(propMembers)
    } else if (allMembers[workspaceId]) {
      setMembers(allMembers[workspaceId])
    }
  }, [workspaceId, propMembers, allMembers])
  
  // Get current user info
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(propUserId || user?.id || null)
      
      if (!propCurrentUserRole && workspaceId && user?.id) {
        const role = await getUserRole(workspaceId)
        setCurrentUserRole(role as ApiWorkspaceRole)
      }
    }
    
    getCurrentUser()
  }, [supabase, propUserId, propCurrentUserRole, workspaceId, getUserRole])
  
  // Format dates for display
  const formatJoinDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
  }
  
  if (isLoading) {
    return (
      <div className="mt-4 text-center py-8 text-muted-foreground">
        <p>Loading members...</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {/* Column headers */}
      <div className="grid grid-cols-[auto_1fr_120px_150px_48px] px-3 py-2 text-sm font-medium text-muted-foreground border-b gap-3">
        {/* Avatar spacer */}
        <div></div>
        
        {/* Name header */}
        <div className="text-left -ml-3">Name</div>
        
        {/* Role header */}
        <div className="hidden md:block">Role</div>
        
        {/* Joined header */}
        <div className="hidden md:block">Joined</div>
        
        {/* Actions spacer */}
        <div></div>
      </div>
      
      <ScrollArea className="">
        <div>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No members found matching your criteria.</p>
            </div>
          ) : (
            members.map((member) => (
              <MemberItem
                key={member.userId}
                member={member}
                joinedDate={formatJoinDate(member.joinedAt)}
                currentUserRole={currentUserRole}
                isCurrentUser={member.userId === currentUserId}
                isLastOwner={
                  member.role === 'owner' && 
                  members.filter(m => m.role === ('owner' as ApiWorkspaceRole)).length === 1
                }
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
