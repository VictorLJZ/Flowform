"use client"

import { useAuthSession } from "@/hooks/useAuthSession"
import { WorkspaceMemberWithProfile, WorkspaceRole } from "@/types/workspace-types"
import { MemberItem } from "@/components/workspace/members/member-item"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MembersListProps {
  members: WorkspaceMemberWithProfile[]
  currentUserRole?: WorkspaceRole
  currentUserId?: string | null
}

export function MembersList({ 
  members, 
  currentUserRole, 
  currentUserId: propUserId 
}: MembersListProps) {
  const { user } = useAuthSession()
  const currentUserId = propUserId || user?.id
  
  // Format dates for display
  const formatJoinDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
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
                key={member.user_id}
                member={member}
                joinedDate={formatJoinDate(member.joined_at)}
                currentUserRole={currentUserRole}
                isCurrentUser={member.user_id === currentUserId}
                isLastOwner={
                  member.role === 'owner' && 
                  members.filter(m => m.role === ('owner' as WorkspaceRole)).length === 1
                }
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
