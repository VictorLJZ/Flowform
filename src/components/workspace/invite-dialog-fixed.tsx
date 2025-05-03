"use client"

import { useState } from "react"
import { Plus, Trash2, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useWorkspaceInvitations } from "@/hooks/useWorkspaceInvitations"
import { Workspace } from "@/types/supabase-types"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

type InviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWorkspace: Workspace | null | undefined
}

type InviteInput = {
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
}

export function InviteDialog({ open, onOpenChange, currentWorkspace }: InviteDialogProps) {
  const { toast } = useToast()
  
  const {
    invitations: sentInvitations,
    send,
    isLoading,
    error: invitationError,
    clearError,
    invitationLimit,
  } = useWorkspaceInvitations(currentWorkspace?.id)
  
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
    
    if (field === 'role' && (value === 'owner' || value === 'admin' || value === 'editor' || value === 'viewer')) {
      newInvites[index].role = value
    } else if (field === 'email') {
      newInvites[index].email = value
    }
    
    setInvites(newInvites)
  }
  
  const handleSendInvitations = async () => {
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
    
    try {
      await send(validInvites)
      
      toast({
        title: "Invitations sent",
        description: `Successfully sent ${validInvites.length} invitation${validInvites.length > 1 ? 's' : ''}.`,
      })
      
      // Reset form and close dialog
      setInvites([{ email: "", role: "editor" }])
      onOpenChange(false)
    } catch (error) {
      // The error will be handled by the store and displayed in the UI
      console.error('Error sending invitations:', error)
    }
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) clearError()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-lg border bg-card shadow">
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
          {invitationError && (
            <Alert variant="destructive" className="mt-2 mb-4">
              <AlertDescription>{invitationError}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="grid grid-cols-[1fr_120px] gap-4 w-full">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm font-medium">Role</p>
              </div>
              <div className="w-9"></div> {/* Spacer for delete button */}
            </div>
            
            <ScrollArea className="max-h-[240px] overflow-y-auto">
              <div className="space-y-3 pr-1"> 
                {invites.map((invite, index) => (
                  <div key={index} className="grid grid-cols-[minmax(0,1fr)_120px_auto] gap-3 items-center">
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
                        <SelectItem value="owner">Owner</SelectItem>
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
            </ScrollArea>
            
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
