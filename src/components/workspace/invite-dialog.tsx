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
      // Clear any invitation errors when opening/closing dialog
      if (!isOpen) {
        clearError()
      }
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite to {currentWorkspace?.name || "workspace"}
          </DialogTitle>
          <DialogDescription>
            Invite team members to collaborate in this workspace. 
            {remainingInvites > 0 ? (
              <span>
                You can invite up to <Badge variant="outline">{remainingInvites}</Badge> more people.
              </span>
            ) : (
              <span className="text-destructive">
                You&apos;ve reached the maximum number of pending invitations ({invitationLimit}).
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {invitationError && (
          <Alert variant="destructive" className="my-2">
            <AlertDescription>
              {invitationError}
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-4 py-2">
            {invites.map((invite, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor={`email-${index}`} className="text-xs">
                    Email {index + 1}
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={invite.email}
                    onChange={(e) => handleInviteChange(index, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className={!emailRegex.test(invite.email) && invite.email ? "border-destructive" : ""}
                  />
                </div>
                <div className="w-1/3">
                  <Label htmlFor={`role-${index}`} className="text-xs">
                    Role
                  </Label>
                  <Select
                    value={invite.role}
                    onValueChange={(value) => handleInviteChange(index, 'role', value)}
                  >
                    <SelectTrigger id={`role-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {index > 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveInvite(index)}
                    className="mb-[2px]"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleAddInvite}
            disabled={remainingInvites <= 0 || invites.length >= remainingInvites}
          >
            <Plus className="h-4 w-4" />
            Add another
          </Button>
          <p className="text-xs text-muted-foreground">
            {remainingInvites} invite{remainingInvites !== 1 ? 's' : ''} remaining
          </p>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setInvites([{ email: "", role: "editor" }])
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="gap-1"
            onClick={handleSendInvitations}
            disabled={isLoading || invites.every(invite => !invite.email.trim())}
          >
            {isLoading ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Invitations
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
