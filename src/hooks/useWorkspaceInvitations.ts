import useSWR from 'swr'
import { getSentInvitations, inviteToWorkspace, resendInvitation, revokeInvitation } from '@/services/workspace/client'
import { useAuthSession } from '@/hooks/useAuthSession'

const DEFAULT_INVITATION_LIMIT = 10

/**
 * Hook to manage workspace invitations (sent invites) via SWR
 */
export function useWorkspaceInvitations(workspaceId: string | null | undefined) {
  const { user, isLoading: isAuthLoading } = useAuthSession()
  const userId = user?.id
  const key = workspaceId && userId ? ['workspaceInvitations', workspaceId] : null
  const fetcher = async ([, id]: [string, string]) => {
    return await getSentInvitations(id)
  }
  const { data, error, isLoading, mutate } = useSWR(key, fetcher)

  const send = async (
    invites: { email: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }[]
  ) => {
    if (!workspaceId || !userId) throw new Error('Missing workspaceId or userId')
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
