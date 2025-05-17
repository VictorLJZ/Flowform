"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWorkspace } from "@/hooks/useWorkspace"
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers"
import { UiWorkspace } from "@/types/workspace/UiWorkspace"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

type InviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWorkspace?: UiWorkspace | null
}

type InviteInput = {
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export function InviteDialog({ open, onOpenChange, currentWorkspace }: InviteDialogProps) {
  const { toast } = useToast()
  
  // Use our unified workspace hooks
  const {
    currentWorkspace: contextWorkspace,
    invitations,
    invitationsLoading,
    fetchInvitations
  } = useWorkspace()
  
  // Use the workspace members hook for the inviteUser function
  const { inviteUser } = useWorkspaceMembers()
  
  // We don't need to check permissions here as the Dialog is only shown to users with the right permissions
  // Permission check is done at the parent component level
  
  // Determine which workspace to use for invitations
  const workspaceToUse = currentWorkspace || contextWorkspace
  const workspaceId = workspaceToUse?.id
  
  // Ensure we load invitations for this workspace when the dialog opens
  useEffect(() => {
    if (open && workspaceId) {
      fetchInvitations(workspaceId)
    }
  }, [open, workspaceId, fetchInvitations])
  
  // Derive values from our store
  const sentInvitations = invitations[workspaceId || ''] || []
  const isLoading = invitationsLoading[workspaceId || ''] || false
  const invitationLimit = 10 // Hardcoded limit for now
  
  // For storing the list of email/role pairs to invite
  const [invites, setInvites] = useState<InviteInput[]>([
    { email: "", role: "editor" }
  ])
  
  // Count current pending invitations to enforce limit
  const pendingInvitesCount = sentInvitations.filter(inv => inv.status === "pending").length
  const remainingInvitesTotal = invitationLimit - pendingInvitesCount
  // Subtract current form rows from the total remaining
  const remainingInvites = remainingInvitesTotal - invites.length + 1 // +1 because first row doesn't count against limit
  
  const handleAddInvite = () => {
    if (remainingInvites > 0) {
      setInvites([...invites, { email: "", role: "editor" }])
    } else {
      toast({
        title: "Invitation limit reached",
        description: `You can only have ${invitationLimit} pending invitations at a time.`,
        variant: "destructive"
      })
    }
  }
  
  const handleRemoveInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index))
  }
  
  const handleInviteChange = (index: number, field: keyof InviteInput, value: string) => {
    const newInvites = [...invites]
    
    if (field === 'role' && (value === 'admin' || value === 'editor' || value === 'viewer')) {
      newInvites[index].role = value
    } else if (field === 'email') {
      newInvites[index].email = value
    }
    
    setInvites(newInvites)
  }
  
  const handleSendInvitations = async () => {
    // Double check we have a valid workspace ID before proceeding
    if (!workspaceId) {
      console.error('[InviteDialog] No workspace ID available when sending invitations')
      toast({
        title: "Missing workspace",
        description: "Please select a workspace before inviting members.",
        variant: "destructive"
      })
      return
    }
    
    // Filter out empty emails
    const validInvites = invites.filter(invite => invite.email.trim() !== "")
    
    if (validInvites.length === 0) {
      toast({
        title: "No valid invites",
        description: "Please enter at least one email address.",
        variant: "destructive"
      })
      return
    }
    
    // Try to send all invitations
    let successCount = 0
    let errorCount = 0
    
    console.log('[InviteDialog] Starting invitation process for', validInvites.length, 'invites');
    
    for (const invite of validInvites) {
      try {
        console.log(`[InviteDialog] Inviting ${invite.email} with role ${invite.role}`);
        
        // Use the enhanced inviteUser function which handles both creating the invitation
        // and sending the email in a single flow
        const result = await inviteUser(invite.email, invite.role);
        
        if (result) {
          console.log(`[InviteDialog] Successfully invited ${invite.email}`, result);
          successCount++;
        } else {
          console.error(`[InviteDialog] Failed to invite ${invite.email} - null result returned`);
          errorCount++;
        }
      } catch (error) {
        console.error(`[InviteDialog] Error inviting ${invite.email}:`, error);
        errorCount++;
      }
    }
    
    console.log(`[InviteDialog] Invitation process completed: ${successCount} succeeded, ${errorCount} failed`);
    
    // Close dialog on success, show result toast
    if (successCount > 0) {
      setInvites([{ email: "", role: "editor" }])
      
      // Close the dialog
      onOpenChange(false)
      
      // Show success toast
      if (errorCount === 0) {
        toast({
          title: "Invitations sent",
          description: `Successfully sent ${successCount} ${successCount === 1 ? 'invitation' : 'invitations'}`,
        })
      } else {
        toast({
          title: "Invitations sent with errors",
          description: `Sent ${successCount} of ${validInvites.length} invitations successfully.`,
          variant: "destructive"
        })
      }
    } else if (errorCount > 0) {
      toast({
        title: "Failed to send invitations",
        description: `Could not send any invitations. Please check your inputs and try again.`,
        variant: "destructive"
      })
    }
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Just close the dialog, no need to clear errors with our new architecture
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-lg border bg-card shadow">
        <style jsx global>{`
          .invite-scroll-area {
            scrollbar-gutter: stable both-edges;
            overflow-y: auto;
          }
          .invite-scroll-area::-webkit-scrollbar {
            width: 4px;
            background: transparent;
          }
          .invite-scroll-area::-webkit-scrollbar-track {
            background: transparent;
          }
          .invite-scroll-area::-webkit-scrollbar-thumb {
            background-color: rgba(155, 155, 155, 0.5);
            border-radius: 20px;
          }
        `}</style>
        <DialogHeader className="p-6 pb-2 bg-card">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            Invite team members
          </DialogTitle>
          <DialogDescription>
            Invite people to collaborate in this workspace
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6 bg-card">
          {/* Error handling now happens in individual toast notifications */}
          
          <div className="mt-4">
            {/* Outer container for both headers and form to ensure consistent padding */}
            <div className="mb-2">
              {/* Header row with exact same structure as form items */}
              <div className="grid grid-cols-[minmax(0,1fr)_120px_40px] gap-3 w-full items-center pr-1 pb-2 pl-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm font-medium">Role</p>
                <div></div> {/* Empty space for delete button column */}
              </div>
            </div>
            
            {/* Key fix: Use a wrapper with fixed width to prevent layout shift */}
            <div className="max-h-[240px] relative">
              <div className="invite-scroll-area max-h-[240px] pr-0 pt-1 pb-1 overflow-visible">
                <div className="space-y-3 overflow-visible">
                  {invites.map((invite, index) => (
                    <div key={index} className="grid grid-cols-[minmax(0,1fr)_120px_40px] gap-3 items-center">
                      <div className="min-w-0">
                        <Input
                          type="email"
                          value={invite.email}
                          onChange={(e) => handleInviteChange(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className={!emailRegex.test(invite.email) && invite.email ? "border-destructive" : ""}
                        />
                      </div>
                      
                      <Select
                        value={invite.role}
                        onValueChange={(value) => handleInviteChange(index, 'role', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveInvite(index)}
                        disabled={index === 0 || invites.length === 1}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-primary"
                onClick={handleAddInvite}
                disabled={remainingInvites <= 0}
              >
                <Plus className="h-4 w-4" />
                Add another
              </Button>
              
              <p className="text-xs text-muted-foreground">
                {remainingInvites} {remainingInvites === 1 ? 'invite' : 'invites'} remaining
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-8 pt-4 border-t gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setInvites([{ email: "", role: "editor" }])
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvitations}
              disabled={isLoading || invites.every(invite => !invite.email.trim())}
            >
              {isLoading ? "Sending..." : "Send Invitations"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
