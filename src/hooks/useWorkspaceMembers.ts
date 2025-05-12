import { getWorkspaceMembersClient } from '@/services/workspace/getWorkspaceMembersClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { ApiWorkspaceRole, ApiWorkspaceMemberWithProfile } from '@/types/workspace'
import { changeUserRoleClient, removeWorkspaceMemberClient } from '@/services/workspace/client'
import { useWorkspaceSWR, createWorkspaceFetcher } from './swr'

/**
 * Hook for fetching and managing workspace members
 */
export function useWorkspaceMembers(workspaceId: string | null | undefined) {
  const { user } = useAuthSession()
  const userId = user?.id
  
  // Create a workspace-aware fetcher
  const membersFetcher = createWorkspaceFetcher(async (wsId: string) => {
    return await getWorkspaceMembersClient(wsId)
  })
  
  // Special case: We need user to be authenticated to fetch members
  // If no user is available, don't trigger the fetch
  const shouldFetch = !!userId
  
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useWorkspaceSWR<ApiWorkspaceMemberWithProfile[]>(
    'workspaceMembers',
    membersFetcher,
    {
      // Keep previous data while revalidating
      keepPreviousData: true,
      // Don't fetch if user is not available
      isPaused: () => !shouldFetch,
    },
    workspaceId // Pass explicit workspaceId
  )
  
  /**
   * Change the role of a workspace member
   */
  const changeRole = async (memberId: string, role: ApiWorkspaceRole) => {
    if (!workspaceId) return
    
    try {
      await changeUserRoleClient(workspaceId, memberId, role)
      return mutate()
    } catch (error) {
      console.error('Error changing member role:', error)
      throw error
    }
  }
  
  /**
   * Remove a member from the workspace
   */
  const removeMember = async (memberId: string) => {
    if (!workspaceId) return
    
    try {
      await removeWorkspaceMemberClient(workspaceId, memberId)
      return mutate()
    } catch (error) {
      console.error('Error removing workspace member:', error)
      throw error
    }
  }
  
  /**
   * Get the current user's role in this workspace
   */
  const getCurrentUserRole = (): ApiWorkspaceRole | null => {
    if (!data || !userId) return null
    
    const currentUserMember = data.find(member => member.userId === userId)
    return currentUserMember?.role as ApiWorkspaceRole || null
  }
  
  /**
   * Check if the current user has admin privileges
   */
  const isCurrentUserAdmin = (): boolean => {
    const role = getCurrentUserRole()
    return role === ('owner' as ApiWorkspaceRole) || role === ('admin' as ApiWorkspaceRole)
  }
  
  return {
    members: data || [],
    error,
    isLoading,
    mutate,
    changeRole,
    removeMember,
    getCurrentUserRole,
    isCurrentUserAdmin,
  }
}
