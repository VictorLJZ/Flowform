import useSWR from 'swr'
import { useEffect, useRef } from 'react'
import { getSentInvitations, inviteToWorkspace, resendInvitation, revokeInvitation } from '@/services/workspace/client'
import { useAuthSession } from '@/hooks/useAuthSession'

const DEFAULT_INVITATION_LIMIT = 10

/**
 * Hook to manage workspace invitations (sent invites) via SWR
 */
export function useWorkspaceInvitations(workspaceId: string | null | undefined) {
  const { user, isLoading: isAuthLoading } = useAuthSession()
  const userId = user?.id
  
  // Track previous workspaceId to detect changes
  const prevWorkspaceIdRef = useRef<string | null | undefined>(workspaceId)
  
  // Log the params for debugging
  console.log('[useWorkspaceInvitations] initialized with:', { 
    workspaceId, 
    userId: userId || 'undefined',
    prevWorkspaceId: prevWorkspaceIdRef.current || 'undefined',
  });
  
  const key = workspaceId && userId ? ['workspaceInvitations', workspaceId] : null
  const fetcher = async ([, id]: [string, string]) => {
    return await getSentInvitations(id)
  }
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)
  
  // Revalidate data when workspaceId changes from null/undefined to a valid ID
  useEffect(() => {
    // If we previously had no workspaceId but now we do, refresh the data
    if ((!prevWorkspaceIdRef.current || prevWorkspaceIdRef.current === 'undefined') && workspaceId) {
      console.log('[useWorkspaceInvitations] WorkspaceId became available, refreshing:', workspaceId);
      mutate();
    }
    
    // If workspaceId changed to a different valid ID, refresh
    if (prevWorkspaceIdRef.current && workspaceId && prevWorkspaceIdRef.current !== workspaceId) {
      console.log('[useWorkspaceInvitations] WorkspaceId changed, refreshing:', {
        from: prevWorkspaceIdRef.current,
        to: workspaceId
      });
      mutate();
    }
    
    // Update ref for next render
    prevWorkspaceIdRef.current = workspaceId;
  }, [workspaceId, mutate]);

  const send = async (
    invites: { email: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }[]
  ) => {
    console.log('[useWorkspaceInvitations] Sending invites with context:', { 
      workspaceId, 
      userId, 
      inviteCount: invites.length,
    });
    
    if (!workspaceId) {
      console.error('[useWorkspaceInvitations] Missing workspaceId when sending invites')
      throw new Error('Missing workspaceId. Please select a workspace before inviting members.')
    }
    
    if (!userId) {
      console.error('[useWorkspaceInvitations] Missing userId when sending invites')
      throw new Error('Missing userId. Please ensure you are logged in.')
    }
    
    await Promise.all(
      invites.map((inv) =>
        inviteToWorkspace(workspaceId, inv.email, inv.role, userId)
      )
    )
    return mutate()
  }

  const resend = async (inviteId: string) => {
    await resendInvitation(inviteId)
    return mutate()
  }

  const revoke = async (inviteId: string) => {
    await revokeInvitation(inviteId)
    return mutate()
  }

  return {
    invitations: data ?? [],
    error,
    isLoading: isLoading || isAuthLoading,
    isAuthLoading,
    send,
    resend,
    revoke,
    invitationLimit: DEFAULT_INVITATION_LIMIT,
    clearError: () => mutate(),
    mutate,
  }
}
