"use client"

import { useState } from "react"
import { Plus, Trash2, Send, Users } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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
  const remainingInvites = invitationLimit - pendingInvitesCount
  
  const handleAddInvite = () => {
    if (invites.length < remainingInvites) {
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
        <div className="p-6 bg-card">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Invite team members
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Invite team members to collaborate in this workspace.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="-mt-2 -mr-2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </div>
          
          {invitationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{invitationError}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="grid grid-cols-[1fr_120px] gap-4 w-full">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm font-medium">Role</p>
              </div>
              <div className="w-9"></div> {/* Spacer for delete button */}
            </div>
            
            <ScrollArea className="max-h-[240px]">
              <div className="space-y-3 pr-1"> {/* Added right padding to prevent highlighting cutoff */}
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
                disabled={remainingInvites <= 0 || invites.length >= remainingInvites}
              >
                <Plus className="h-4 w-4" />
                Add another
              </Button>
              
              <p className="text-xs text-muted-foreground">
                {remainingInvites} {remainingInvites === 1 ? 'invite' : 'invites'} remaining
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
