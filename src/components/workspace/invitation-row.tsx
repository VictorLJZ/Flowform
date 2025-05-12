"use client"

import type { UiWorkspaceInvitation } from "@/types/workspace"
import { useState } from "react"
import { format } from "date-fns"
import { useWorkspaceInvitations } from "@/hooks/useWorkspaceInvitations"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RefreshCw, X, Copy, CheckCircle } from "lucide-react"

interface InvitationRowProps {
  invitation: UiWorkspaceInvitation
}

export function InvitationRow({ invitation }: InvitationRowProps) {
  const { toast } = useToast()
  const { resend, revoke, isLoading } = useWorkspaceInvitations(invitation.workspaceId)
  const [isResending, setIsResending] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  // Format dates
  const invitedDate = format(new Date(invitation.invitedAt), 'MMM d, yyyy')
  const expiresDate = format(new Date(invitation.expiresAt), 'MMM d, yyyy')
  const isPending = invitation.status === 'pending'
  const isExpired = new Date(invitation.expiresAt) < new Date()
  
  // Role colors
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/20 text-purple-700 dark:bg-purple-500/30 dark:text-purple-300'
      case 'admin': return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300'
      case 'editor': return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300'
      case 'viewer': return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300'
      default: return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300'
    }
  }
  
  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return isExpired ? 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/30 dark:text-orange-300' : 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300'
      case 'accepted': return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300'
      case 'declined': return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300'
      case 'expired': return 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/30 dark:text-orange-300'
      default: return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300'
    }
  }
  
  const displayStatus = isExpired && invitation.status === 'pending' ? 'expired' : invitation.status
  
  const handleResendInvitation = async () => {
    setIsResending(true)
    try {
      await resend(invitation.id)
      toast({
        title: "Invitation resent",
        description: `Invitation to ${invitation.email} has been resent.`,
      })
    } catch (error) {
      console.error('Error resending invitation:', error)
    } finally {
      setIsResending(false)
    }
  }
  
  const handleRevokeInvitation = async () => {
    setIsRevoking(true)
    try {
      await revoke(invitation.id)
      toast({
        title: "Invitation revoked",
        description: `Invitation to ${invitation.email} has been revoked.`,
      })
    } catch (error) {
      console.error('Error revoking invitation:', error)
    } finally {
      setIsRevoking(false)
    }
  }
  
  const handleCopyInviteLink = () => {
    // In a real application, this would use the actual domain
    const inviteLink = `${window.location.origin}/invite/${invitation.token}`
    navigator.clipboard.writeText(inviteLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Invitation link copied",
      description: "Share this link with the recipient to accept the invitation.",
    })
  }
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{invitation.email}</span>
            <Badge variant="secondary" className={getRoleColor(invitation.role)}>
              {invitation.role}
            </Badge>
            <Badge className={getStatusColor(displayStatus)}>
              {displayStatus}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Invited on {invitedDate} {isPending ? `• Expires on ${expiresDate}` : ''}
          </div>
        </div>
        <div className="flex gap-1">
          {isPending && !isExpired && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyInviteLink}
                    disabled={isLoading}
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy invite link</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleResendInvitation}
                    disabled={isResending || isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resend invitation</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
          
          {isPending && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRevokeInvitation}
                  disabled={isRevoking || isLoading}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Revoke invitation</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
