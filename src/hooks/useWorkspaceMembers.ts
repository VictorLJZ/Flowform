/**
 * Workspace Members Management Hook
 * 
 * This hook focuses on workspace member operations and invitation management.
 * It provides specialized functions for handling members, invitations, role changes, 
 * and other member-related operations in a cohesive way.
 */

import { useCallback, useState, useEffect } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspacePermissions } from '@/hooks/useWorkspacePermissions';
import { useAuth } from '@/providers/auth-provider';
import { 
  ApiWorkspaceRole, 
  ApiWorkspaceInvitationInput
} from '@/types/workspace/ApiWorkspace';
import { 
  apiToUiWorkspaceMemberWithProfile, 
  apiToUiWorkspaceInvitation 
} from '@/utils/type-utils/workspace/ApiToUiWorkspace';
import { UiWorkspaceMemberWithProfile, UiWorkspaceInvitation } from '@/types/workspace/UiWorkspace';

export function useWorkspaceMembers(workspaceId?: string) {
  const { 
    members, 
    invitations, 
    fetchMembers, 
    fetchInvitations, 
    updateMemberRole, 
    removeMember,
    createInvitation,
    deleteInvitation,
    currentWorkspace,
    leaveWorkspace,
    membersLoading,
    invitationsLoading
  } = useWorkspace();
  
  const { canManageMembers, getUserRole, isOwner } = useWorkspacePermissions();
  const { supabase } = useAuth();
  
  // Local state for transformed members and invitations
  const [uiMembers, setUiMembers] = useState<UiWorkspaceMemberWithProfile[]>([]);
  const [uiInvitations, setUiInvitations] = useState<UiWorkspaceInvitation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get the active workspace ID
  const activeWorkspaceId = workspaceId || currentWorkspace?.id;
  
  // Get current user ID once
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    getCurrentUser();
  }, [supabase]);
  
  // Load members when needed
  useEffect(() => {
    if (activeWorkspaceId && !members[activeWorkspaceId]) {
      fetchMembers(activeWorkspaceId);
    }
  }, [activeWorkspaceId, members, fetchMembers]);
  
  // Load invitations when needed
  useEffect(() => {
    const loadInvitations = async () => {
      if (activeWorkspaceId) {
        const canManage = await canManageMembers(activeWorkspaceId);
        if (canManage && !invitations[activeWorkspaceId]) {
          fetchInvitations(activeWorkspaceId);
        }
      }
    };
    
    loadInvitations();
  }, [activeWorkspaceId, invitations, fetchInvitations, canManageMembers]);
  
  // Transform members to UI format when they change
  useEffect(() => {
    if (activeWorkspaceId && members[activeWorkspaceId]) {
      const membersWithProfiles = members[activeWorkspaceId].map(member => 
        apiToUiWorkspaceMemberWithProfile(member, currentUserId || undefined)
      );
      setUiMembers(membersWithProfiles);
    }
  }, [activeWorkspaceId, members, currentUserId]);
  
  // Transform invitations to UI format when they change
  useEffect(() => {
    if (activeWorkspaceId && invitations[activeWorkspaceId]) {
      const transformedInvitations = invitations[activeWorkspaceId].map(apiToUiWorkspaceInvitation);
      setUiInvitations(transformedInvitations);
    }
  }, [activeWorkspaceId, invitations]);
  
  /**
   * Get the current user's membership details
   */
  const getCurrentUserMembership = useCallback((): UiWorkspaceMemberWithProfile | null => {
    if (!activeWorkspaceId || !currentUserId) return null;
    
    return uiMembers.find(member => member.userId === currentUserId) || null;
  }, [activeWorkspaceId, currentUserId, uiMembers]);
  
  /**
   * Get pending invitations only (filtered)
   */
  const getPendingInvitations = useCallback((): UiWorkspaceInvitation[] => {
    return uiInvitations.filter(invitation => invitation.status === 'pending');
  }, [uiInvitations]);
  
  /**
   * Invite a new user to the workspace
   */
  const inviteUser = useCallback(async (
    email: string, 
    role: ApiWorkspaceRole,
    message?: string
  ): Promise<UiWorkspaceInvitation | null> => {
    if (!activeWorkspaceId) return null;
    
    const input: ApiWorkspaceInvitationInput = {
      email,
      role,
      message
    };
    
    const invitation = await createInvitation(activeWorkspaceId, input);
    return invitation ? apiToUiWorkspaceInvitation(invitation) : null;
  }, [activeWorkspaceId, createInvitation]);
  
  /**
   * Cancel a pending invitation
   */
  const cancelInvitation = useCallback(async (
    invitationId: string
  ): Promise<boolean> => {
    if (!activeWorkspaceId) return false;
    
    try {
      await deleteInvitation(activeWorkspaceId, invitationId);
      return true;
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      return false;
    }
  }, [activeWorkspaceId, deleteInvitation]);
  
  /**
   * Change a member's role
   */
  const changeMemberRole = useCallback(async (
    userId: string,
    newRole: ApiWorkspaceRole
  ): Promise<boolean> => {
    if (!activeWorkspaceId) return false;
    
    try {
      await updateMemberRole(activeWorkspaceId, userId, newRole);
      return true;
    } catch (error) {
      console.error('Failed to change member role:', error);
      return false;
    }
  }, [activeWorkspaceId, updateMemberRole]);
  
  /**
   * Remove a member from the workspace
   */
  const removeMemberFromWorkspace = useCallback(async (
    userId: string
  ): Promise<boolean> => {
    if (!activeWorkspaceId) return false;
    
    try {
      await removeMember(activeWorkspaceId, userId);
      return true;
    } catch (error) {
      console.error('Failed to remove member:', error);
      return false;
    }
  }, [activeWorkspaceId, removeMember]);
  
  /**
   * Current user leaves the workspace
   */
  const leaveCurrentWorkspace = useCallback(async (): Promise<boolean> => {
    if (!activeWorkspaceId) return false;
    
    try {
      await leaveWorkspace(activeWorkspaceId);
      return true;
    } catch (error) {
      console.error('Failed to leave workspace:', error);
      return false;
    }
  }, [activeWorkspaceId, leaveWorkspace]);
  
  /**
   * Find member by user ID
   */
  const getMemberById = useCallback((userId: string): UiWorkspaceMemberWithProfile | null => {
    return uiMembers.find(member => member.userId === userId) || null;
  }, [uiMembers]);
  
  /**
   * Get the workspace owner(s)
   */
  const getOwners = useCallback((): UiWorkspaceMemberWithProfile[] => {
    return uiMembers.filter(member => member.role === 'owner');
  }, [uiMembers]);
  
  /**
   * Sort members by role importance
   */
  const getSortedMembers = useCallback((): UiWorkspaceMemberWithProfile[] => {
    const roleWeight = {
      'owner': 4,
      'admin': 3,
      'editor': 2,
      'viewer': 1
    };
    
    return [...uiMembers].sort((a, b) => {
      // Sort by role first (most important roles first)
      const roleDiff = (roleWeight[b.role as keyof typeof roleWeight] || 0) - 
                       (roleWeight[a.role as keyof typeof roleWeight] || 0);
      
      if (roleDiff !== 0) return roleDiff;
      
      // Then sort by name
      const nameA = a.profile?.displayName || '';
      const nameB = b.profile?.displayName || '';
      return nameA.localeCompare(nameB);
    });
  }, [uiMembers]);
  
  // Return all member management functions and data
  return {
    // Member state
    members: uiMembers,
    sortedMembers: getSortedMembers(),
    currentMembership: getCurrentUserMembership(),
    owners: getOwners(),
    isLoading: membersLoading[activeWorkspaceId || ''] || false,
    
    // Invitation state
    invitations: uiInvitations,
    pendingInvitations: getPendingInvitations(),
    isLoadingInvitations: invitationsLoading[activeWorkspaceId || ''] || false,
    
    // Member operations
    getMemberById,
    changeMemberRole,
    removeMemberFromWorkspace,
    leaveCurrentWorkspace,
    
    // Invitation operations
    inviteUser,
    cancelInvitation,
    
    // Permissions (re-exported)
    getUserRole,
    isOwner,
    canManageMembers,
    
    // Core operations
    refreshMembers: activeWorkspaceId ? () => fetchMembers(activeWorkspaceId) : () => Promise.resolve([]),
    refreshInvitations: activeWorkspaceId ? () => fetchInvitations(activeWorkspaceId) : () => Promise.resolve([])
  };
}
