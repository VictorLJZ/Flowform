"use client"

import { useEffect } from "react"
import { useWorkspaceStore } from "@/stores/workspaceStore"
import { WorkspaceInvitation } from "@/types/supabase-types"
import { InvitationRow } from "@/components/workspace/invitation-row"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, LoaderCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InvitationListProps {
  workspaceId: string
}

export function InvitationList({ workspaceId }: InvitationListProps) {
  const { 
    sentInvitations, 
    isLoadingInvitations, 
    invitationError, 
    fetchSentInvitations,
    clearInvitationError 
  } = useWorkspaceStore()
  
  useEffect(() => {
    // Fetch invitations when component mounts
    fetchSentInvitations(workspaceId)
    
    // Clear any errors when unmounting
    return () => {
      clearInvitationError()
    }
  }, [workspaceId, fetchSentInvitations, clearInvitationError])
  
  // Filter invitations to show pending ones first, then others
  const sortedInvitations = [...sentInvitations].sort((a, b) => {
    // First sort by status (pending first)
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    
    // Then sort by invited_at date (newest first)
    return new Date(b.invited_at).getTime() - new Date(a.invited_at).getTime()
  })
  
  const pendingInvitations = sortedInvitations.filter(inv => inv.status === 'pending')
  const otherInvitations = sortedInvitations.filter(inv => inv.status !== 'pending')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Workspace Invitations
        </CardTitle>
        <CardDescription>
          Manage pending and previously sent invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invitationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{invitationError}</AlertDescription>
          </Alert>
        )}
        
        {isLoadingInvitations ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center py-2">
              <LoaderCircle className="h-5 w-5 animate-spin" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : sortedInvitations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No invitations have been sent yet.</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            {pendingInvitations.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Pending Invitations</h3>
                <div className="space-y-2">
                  {pendingInvitations.map((invitation) => (
                    <InvitationRow 
                      key={invitation.id} 
                      invitation={invitation} 
                    />
                  ))}
                </div>
              </div>
            )}
            
            {otherInvitations.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Past Invitations</h3>
                <div className="space-y-2">
                  {otherInvitations.map((invitation) => (
                    <InvitationRow 
                      key={invitation.id} 
                      invitation={invitation} 
                    />
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
