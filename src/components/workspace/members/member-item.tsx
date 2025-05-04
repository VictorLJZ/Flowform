"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { useAuthSession } from "@/hooks/useAuthSession"
import { changeUserRoleClient, removeWorkspaceMemberClient } from "@/services/workspace/client"
import { WorkspaceMemberWithProfile } from "@/types/workspace-types"
import { WorkspaceRole } from "@/types/workspace-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, UserMinus, Shield, AlertTriangle } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MemberItemProps {
  member: WorkspaceMemberWithProfile
  joinedDate: string
  isCurrentUser: boolean
  isLastOwner: boolean
  currentUserRole?: WorkspaceRole
}

export function MemberItem({ 
  member, 
  joinedDate,
  isCurrentUser,
  isLastOwner,
  currentUserRole,
}: MemberItemProps) {
  const { toast } = useToast()
  const { mutate } = useWorkspaceMembers(member.workspace_id)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const targetMemberRole = member.role as WorkspaceRole;

  const canManageRole = (
    initiator?: WorkspaceRole,
    target?: WorkspaceRole
  ): boolean => {
    if (!initiator || !target || isCurrentUser) return false; 
    if (initiator === 'owner') return true; 
    if (initiator === 'admin') return target === 'editor' || target === 'viewer';
    return false; 
  };

  const canAssignRole = (
    initiator?: WorkspaceRole,
    roleToAssign?: WorkspaceRole
  ): boolean => {
      if (!initiator || !roleToAssign) return false;
      if (initiator === 'owner') return true; 
      if (initiator === 'admin') return roleToAssign === 'editor' || roleToAssign === 'viewer';
      return false;
  };
  
  const canRemoveMember = (
    initiator?: WorkspaceRole,
    target?: WorkspaceRole
  ): boolean => {
    if (!initiator || !target || isCurrentUser) return false; 
    if (initiator === 'owner') return target !== 'owner'; 
    if (initiator === 'admin') return target === 'editor' || target === 'viewer';
    return false; 
  };

  const showActions = canManageRole(currentUserRole, targetMemberRole);
  const allowRemove = canRemoveMember(currentUserRole, targetMemberRole);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleRoleChange = async (newRole: string) => {
    if (!['owner', 'admin', 'editor', 'viewer'].includes(newRole)) {
      return
    }
    
    if (newRole === member.role) {
      return
    }
    
    if (currentUserRole === 'owner' && newRole === 'owner' && !isCurrentUser) {
      setShowTransferDialog(true); 
      return; 
    }
    
    setIsLoading(true)
    
    try {
      await changeUserRoleClient(member.workspace_id, member.user_id, newRole as WorkspaceRole)
      
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

  const confirmOwnershipTransfer = async () => {
    setIsLoading(true)
    try {
      await changeUserRoleClient(member.workspace_id, member.user_id, 'owner') 
      await mutate() 
      toast({
        title: "Ownership Transferred",
        description: `${member.profile.full_name} is now the workspace owner. You are now an Admin.`,
      })
    } catch (error) {
      toast({
        title: "Failed to transfer ownership",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowTransferDialog(false)
    }
  }

  const handleRemoveMember = async () => {
    setIsLoading(true)
    
    try {
      await removeWorkspaceMemberClient(member.workspace_id, member.user_id)
      
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
    <div className="grid grid-cols-[auto_1fr_120px_150px_48px] items-center p-3 hover:bg-secondary/20 border-b gap-3">
      <div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.profile.avatar_url || undefined} alt={member.profile.full_name} />
          <AvatarFallback>{getInitials(member.profile.full_name)}</AvatarFallback>
        </Avatar>
      </div>
      
      <div>
        <div className="text-sm">
          {member.profile.full_name}
        </div>
        <div className="text-xs text-muted-foreground">
          {member.profile.email} 
        </div>
      </div>

      <div className="hidden md:block text-sm">
        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
      </div>
      
      <div className="hidden md:block text-sm">
        {joinedDate}
      </div>
      
      <div className="flex justify-center items-center">
        {showActions && (
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
                  <DropdownMenuRadioItem 
                    value="owner"
                    disabled={!canAssignRole(currentUserRole, 'owner') || isLoading}
                  >
                    Owner
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem 
                    value="admin"
                    disabled={!canAssignRole(currentUserRole, 'admin') || isLoading}
                  >
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem 
                    value="editor"
                    disabled={!canAssignRole(currentUserRole, 'editor') || isLoading}
                  >
                    Editor
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem 
                    value="viewer"
                    disabled={!canAssignRole(currentUserRole, 'viewer') || isLoading}
                  >
                    Viewer
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setShowRemoveDialog(true)}
                disabled={!allowRemove || (targetMemberRole === 'owner' && isLastOwner) || isLoading}
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

      <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <AlertDialogContent className="bg-card text-card-foreground border shadow-lg sm:rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="text-warning mr-2 h-5 w-5" /> 
              Confirm Ownership Transfer
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to make{' '}
              <strong className="font-semibold">{member.profile.full_name}</strong>{' '}
              the new workspace owner? You will be demoted to an{' '}
              <strong className="font-semibold">Admin</strong>{' '}
              role and will lose owner privileges. This action cannot be undone easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTransferDialog(false)} disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmOwnershipTransfer}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Transferring..." : "Confirm Transfer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
