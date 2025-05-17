"use client"

import { useEffect } from "react"
import { useWorkspace } from "@/hooks/useWorkspace"
import { InvitationRow } from "@/components/workspace/invitation-row"
import { UiWorkspaceInvitation } from "@/types/workspace/UiWorkspace"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, LoaderCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InvitationListProps {
  workspaceId: string
}

export function InvitationList({ workspaceId }: InvitationListProps) {
  // Use our new unified workspace hook
  const {
    invitations,
    invitationsLoading,
    fetchInvitations,
    isWorkspaceLoading,
    getWorkspaceError
  } = useWorkspace()
  
  // No local state needed with unified hook approach
  
  // Fetch invitations when component mounts or workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      fetchInvitations(workspaceId)
    }
  }, [workspaceId, fetchInvitations])
  
  // Simple error display
  const hasError = getWorkspaceError(workspaceId) !== null
  
  // Get invitations for this workspace
  const sentInvitations = invitations[workspaceId] || []
  const isLoadingInvitations = invitationsLoading[workspaceId] || isWorkspaceLoading(workspaceId)
  
  // No need to convert formats anymore as our hooks now handle that
  const uiInvitations = sentInvitations as UiWorkspaceInvitation[];
  
  // Filter invitations to show pending ones first, then others
  const sortedInvitations = [...uiInvitations].sort((a, b) => {
    // First sort by status (pending first)
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    
    // Then sort by invitedAt date (newest first)
    return new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
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
        {hasError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>Failed to load invitations. Please try again.</AlertDescription>
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
