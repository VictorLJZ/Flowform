"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWorkspace } from "@/hooks/useWorkspace"
import { useAuth } from "@/providers/auth-provider"
import { UiWorkspaceMemberWithProfile } from "@/types/workspace/UiWorkspace"
import { ApiWorkspaceRole } from "@/types/workspace/ApiWorkspace"
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
  member: UiWorkspaceMemberWithProfile
  joinedDate: string
  isCurrentUser: boolean
  isLastOwner: boolean
  currentUserRole?: ApiWorkspaceRole
}

export function MemberItem({ 
  member, 
  joinedDate,
  isCurrentUser,
  isLastOwner,
  currentUserRole,
}: MemberItemProps) {
  const { toast } = useToast()
  const { supabase } = useAuth()
  // Get workspace-related functions
  // Get only the required workspace functions that we'll use
  const { 
    updateMemberRole, 
    removeMember,
  } = useWorkspace()
  
  // Note: We're using our custom role-based permission checks in this component
  // instead of the hook's canManageRole function
  
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const targetMemberRole = member.role as ApiWorkspaceRole;
  
  // Custom permission checks based on role hierarchy
  const canManageUserRole = (initiatorRole?: ApiWorkspaceRole, targetRole?: ApiWorkspaceRole): boolean => {
    if (!initiatorRole || !targetRole || isCurrentUser) return false;
    if (initiatorRole === 'owner') return true;
    if (initiatorRole === 'admin') return targetRole === 'editor' || targetRole === 'viewer';
    return false;
  };
  
  const canRemoveUser = (initiatorRole?: ApiWorkspaceRole, targetRole?: ApiWorkspaceRole): boolean => {
    if (!initiatorRole || !targetRole || isCurrentUser) return false;
    if (initiatorRole === 'owner') return targetRole !== 'owner';
    if (initiatorRole === 'admin') return targetRole === 'editor' || targetRole === 'viewer';
    return false;
  };
  
  const canAssignUserRole = (initiatorRole?: ApiWorkspaceRole, roleToAssign?: ApiWorkspaceRole): boolean => {
    if (!initiatorRole || !roleToAssign) return false;
    if (initiatorRole === 'owner') return true;
    if (initiatorRole === 'admin') return roleToAssign === 'editor' || roleToAssign === 'viewer';
    return false;
  };
  
  // Determine if we should show action buttons based on permissions
  const showActions = canManageUserRole(currentUserRole, targetMemberRole);
  const allowRemove = canRemoveUser(currentUserRole, targetMemberRole);

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
      await updateMemberRole(member.workspaceId, member.userId, newRole as ApiWorkspaceRole)
      
      // No need to manually refresh as the hook handles this
      
      toast({
        title: "Role updated",
        description: `${member.profile.fullName || 'User'} is now a ${newRole}.`,
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
    setIsLoading(true);

    try {
      // Transfer ownership to the target user by updating their role to 'owner'
      await updateMemberRole(member.workspaceId, member.userId, 'owner')
      
      // Get current user ID to update their role
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        // Demote current user (if they're the current owner) to admin
        await updateMemberRole(member.workspaceId, user.id, 'admin')
      }
      
      toast({
        title: "Ownership transferred",
        description: `${member.profile.fullName || 'User'} is now the workspace owner.`,
      })

      setShowTransferDialog(false);
    } catch (error) {
      toast({
        title: "Failed to transfer ownership",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleRemoveMember = async () => {
    setIsLoading(true)
    
    try {
      await removeMember(member.workspaceId, member.userId)
      
      setShowRemoveDialog(false)
      
      toast({
        title: "Member removed",
        description: `${member.profile.fullName || 'User'} has been removed from the workspace.`,
      })
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-[auto_1fr_120px_150px_48px] items-center p-3 hover:bg-secondary/20 border-b gap-3">
      <div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.profile.avatarUrl || undefined} alt={member.profile.fullName || 'User'} />
            <AvatarFallback>{getInitials(member.profile.fullName || '')}</AvatarFallback>
          </Avatar>
      </div>
      
      <div>
        <div className="text-sm">
          {member.profile.fullName}
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
                    disabled={!canAssignUserRole(currentUserRole, 'owner') || isLoading}
                  >
                    Owner
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem 
                    value="admin"
                    disabled={!canAssignUserRole(currentUserRole, 'admin') || isLoading}
                  >
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem 
                    value="editor"
                    disabled={!canAssignUserRole(currentUserRole, 'editor') || isLoading}
                  >
                    Editor
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem 
                    value="viewer"
                    disabled={!canAssignUserRole(currentUserRole, 'viewer') || isLoading}
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
              Are you sure you want to remove <strong>{member.profile.fullName}</strong> from this workspace?
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
              <strong className="font-semibold">{member.profile.fullName}</strong>{' '}
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
