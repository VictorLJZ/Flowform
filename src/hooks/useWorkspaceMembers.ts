import useSWR from 'swr'
import { getWorkspaceMembersClient } from '@/services/workspace/getWorkspaceMembersClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { WorkspaceRole } from '@/types/workspace-types'
import { changeUserRoleClient, removeWorkspaceMemberClient } from '@/services/workspace/client'

/**
 * Hook for fetching and managing workspace members
 */
export function useWorkspaceMembers(workspaceId: string | null | undefined) {
  const { user } = useAuthSession()
  const userId = user?.id
  
  // Only fetch if we have both workspaceId and userId
  const key = workspaceId && userId ? ['workspaceMembers', workspaceId] : null
  
  const fetcher = async ([, id]: [string, string]) => {
    return await getWorkspaceMembersClient(id)
  }
  
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useSWR(key, fetcher, {
    // Keep previous data while revalidating
    keepPreviousData: true,
  })
  
  /**
   * Change the role of a workspace member
   */
  const changeRole = async (memberId: string, role: WorkspaceRole) => {
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
  const getCurrentUserRole = (): WorkspaceRole | null => {
    if (!data || !userId) return null
    
    const currentUserMember = data.find(member => member.user_id === userId)
    return currentUserMember?.role as WorkspaceRole || null
  }
  
  /**
   * Check if the current user has admin privileges
   */
  const isCurrentUserAdmin = (): boolean => {
    const role = getCurrentUserRole()
    return role === ('owner' as WorkspaceRole) || role === ('admin' as WorkspaceRole)
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
