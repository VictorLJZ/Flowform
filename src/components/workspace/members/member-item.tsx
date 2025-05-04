"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { useAuthSession } from "@/hooks/useAuthSession"
import { changeUserRoleClient, removeWorkspaceMemberClient } from "@/services/workspace/client"
import { WorkspaceMemberWithProfile } from "@/types/workspace-types"
import { WorkspaceRole } from "@/types/workspace-types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, UserMinus, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MemberItemProps {
  member: WorkspaceMemberWithProfile
  joinedDate: string
  isAdmin: boolean
  isCurrentUser: boolean
  isLastOwner: boolean
}

export function MemberItem({ 
  member, 
  joinedDate,
  isAdmin,
  isCurrentUser,
  isLastOwner,
}: MemberItemProps) {
  const { toast } = useToast()
  const { mutate } = useWorkspaceMembers(member.workspace_id)
  const { user: authUser } = useAuthSession()
  
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  // Role badge colors
  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      case 'editor': return 'outline'
      default: return 'outline'
    }
  }
  
  // Handle role change
  const handleRoleChange = async (newRole: string) => {
    // Validate role
    if (!['owner', 'admin', 'editor', 'viewer'].includes(newRole)) {
      return
    }
    
    // Don't do anything if role didn't change
    if (newRole === member.role) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await changeUserRoleClient(member.workspace_id, member.user_id, newRole as WorkspaceRole)
      
      // Refresh the members list
      await mutate()
      
      toast({
        title: "Role updated",
        description: `${member.profile.full_name} is now a ${newRole}.`,
      })
    } catch (error) {
      toast({
        title: "Failed to update role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle member removal
  const handleRemoveMember = async () => {
    setIsLoading(true)
    
    try {
      await removeWorkspaceMemberClient(member.workspace_id, member.user_id)
      
      // Refresh the members list
      await mutate()
      
      toast({
        title: "Member removed",
        description: `${member.profile.full_name} has been removed from the workspace.`,
      })
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowRemoveDialog(false)
    }
  }
  
  return (
    <div className="grid grid-cols-[auto_1fr_120px_150px_auto] items-center p-3 hover:bg-secondary/20 border-b gap-3">
      {/* Avatar cell */}
      <div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.profile.avatar_url || undefined} alt={member.profile.full_name} />
          <AvatarFallback>{getInitials(member.profile.full_name)}</AvatarFallback>
        </Avatar>
      </div>
      
      {/* Name cell */}
      <div>
        <div className="text-sm">
          {member.profile.full_name}
        </div>
        <div className="text-xs text-muted-foreground">
          {isCurrentUser ? authUser?.email : `${member.profile.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`}
        </div>
      </div>

      {/* Role cell */}
      <div className="hidden md:block text-sm">
        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
      </div>
      
      {/* Joined date cell */}
      <div className="hidden md:block text-sm">
        {joinedDate}
      </div>
      
      {/* Actions cell */}
      <div>
        {isAdmin && !isCurrentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  Change Role
                </DropdownMenuLabel>
                
                <DropdownMenuRadioGroup value={member.role} onValueChange={handleRoleChange}>
                  <DropdownMenuRadioItem value={"owner" as WorkspaceRole}>
                    Owner
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={"admin" as WorkspaceRole}>
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={"editor" as WorkspaceRole}>
                    Editor
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={"viewer" as WorkspaceRole}>
                    Viewer
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setShowRemoveDialog(true)}
                disabled={isLastOwner && member.role === ('owner' as WorkspaceRole)}
                className="text-destructive"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove from Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove workspace member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{member.profile.full_name}</strong> from this workspace?
              They will lose access to all workspace resources immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRemoveDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRemoveMember}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
