"use client"

import { useAuthSession } from "@/hooks/useAuthSession"
import { WorkspaceMemberWithProfile, WorkspaceRole } from "@/types/workspace-types"
import { MemberItem } from "@/app/dashboard/workspace/members/components/member-item"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MembersListProps {
  members: WorkspaceMemberWithProfile[]
  isCurrentUserAdmin: boolean
  currentUserId?: string | null
}

export function MembersList({ 
  members, 
  isCurrentUserAdmin, 
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
      <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground border-b">
        <div className="flex-1">Name</div>
        <div className="w-24 hidden md:flex items-center justify-center">Role</div>
        <div className="w-32 hidden md:flex items-center justify-end">Joined</div>
        <div className="w-10"></div> {/* Actions column spacer */}
      </div>
      
      <ScrollArea className="pr-4">
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
                isAdmin={isCurrentUserAdmin}
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
