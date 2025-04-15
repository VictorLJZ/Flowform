import { StateCreator } from 'zustand'
import { WorkspaceStore, InvitationActions } from '@/types/store-types'
import { WorkspaceInvitation } from '@/types/supabase-types'
import {
  getPendingInvitations,
  getSentInvitations,
  inviteToWorkspace,
  resendInvitation as resendInvitationService,
  revokeInvitation as revokeInvitationService,
  acceptInvitation as acceptInvitationService,
  declineInvitation as declineInvitationService
} from '@/services/workspace'

export const createInvitationSlice: StateCreator<
  WorkspaceStore,
  [],
  [],
  InvitationActions & Pick<WorkspaceStore, 
    'pendingInvitations' | 'sentInvitations' | 'isLoadingInvitations' | 'invitationError' | 'invitationLimit'
  >
> = (set, get) => ({
  // State
  pendingInvitations: [],
  sentInvitations: [],
  isLoadingInvitations: false,
  invitationError: null,
  invitationLimit: 50, // Default limit of 50 pending invitations per workspace
  
  // Actions
  fetchPendingInvitations: async () => {
    const { userEmail } = get()
    
    if (!userEmail) {
      set({ invitationError: 'User email not set' })
      return
    }
    
    try {
      set({ isLoadingInvitations: true, invitationError: null })
      const invitations = await getPendingInvitations(userEmail)
      set({ 
        pendingInvitations: invitations,
        isLoadingInvitations: false
      })
    } catch (error) {
      console.error('[WorkspaceStore] Error fetching pending invitations:', error)
      set({
        invitationError: error instanceof Error ? error.message : 'Failed to fetch pending invitations',
        isLoadingInvitations: false
      })
    }
  },
  
  fetchSentInvitations: async (workspaceId) => {
    try {
      set({ isLoadingInvitations: true, invitationError: null })
      const invitations = await getSentInvitations(workspaceId)
      set({ 
        sentInvitations: invitations,
        isLoadingInvitations: false
      })
    } catch (error) {
      console.error('[WorkspaceStore] Error fetching sent invitations:', error)
      set({
        invitationError: error instanceof Error ? error.message : 'Failed to fetch sent invitations',
        isLoadingInvitations: false
      })
    }
  },
  
  sendInvitations: async (invites) => {
    const { userId, currentWorkspace, sentInvitations, invitationLimit } = get()
    
    if (!userId) {
      set({ invitationError: 'User ID not set' })
      return []
    }
    
    if (!currentWorkspace) {
      set({ invitationError: 'No workspace selected' })
      return []
    }
    
    // Check if we would exceed the invitation limit
    if (sentInvitations.filter(inv => inv.status === 'pending').length + invites.length > invitationLimit) {
      set({ invitationError: `You can only have up to ${invitationLimit} pending invitations at a time` })
      return []
    }
    
    try {
      set({ isLoadingInvitations: true, invitationError: null })
      
      // Create invitations one by one
      const newInvitations: WorkspaceInvitation[] = []
      const errors: string[] = []
      
      for (const invite of invites) {
        try {
          const invitation = await inviteToWorkspace(
            currentWorkspace.id,
            invite.email,
            invite.role,
            userId
          )
          
          if (invitation) {
            newInvitations.push(invitation)
          }
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : `Failed to invite ${invite.email}`
          errors.push(errorMessage)
        }
      }
      
      // Update the sentInvitations list with any new ones
      const updatedSentInvitations = [...sentInvitations, ...newInvitations]
      
      set({ 
        sentInvitations: updatedSentInvitations,
        isLoadingInvitations: false,
        invitationError: errors.length > 0 
          ? `Failed to send ${errors.length} invitation(s): ${errors.join(', ')}` 
          : null
      })
      
      return newInvitations
    } catch (error) {
      console.error('[WorkspaceStore] Error sending invitations:', error)
      set({
        invitationError: error instanceof Error ? error.message : 'Failed to send invitations',
        isLoadingInvitations: false
      })
      return []
    }
  },
  
  resendInvitation: async (invitationId) => {
    try {
      set({ isLoadingInvitations: true, invitationError: null })
      const invitation = await resendInvitationService(invitationId)
      
      if (invitation) {
        // Update the invitation in the sentInvitations list
        const { sentInvitations } = get()
        const updatedSentInvitations = sentInvitations.map(inv => 
          inv.id === invitationId ? invitation : inv
        )
        
        set({ 
          sentInvitations: updatedSentInvitations,
          isLoadingInvitations: false
        })
      } else {
        set({ 
          invitationError: 'Failed to resend invitation',
          isLoadingInvitations: false
        })
      }
      
      return invitation
    } catch (error) {
      console.error('[WorkspaceStore] Error resending invitation:', error)
      set({
        invitationError: error instanceof Error ? error.message : 'Failed to resend invitation',
        isLoadingInvitations: false
      })
      return null
    }
  },
  
  acceptInvitation: async (token) => {
    const { userId, fetchWorkspaces } = get()
    
    if (!userId) {
      set({ invitationError: 'User ID not set' })
      return null
    }
    
    try {
      set({ isLoadingInvitations: true, invitationError: null })
      const membership = await acceptInvitationService(token, userId)
      
      if (membership) {
        // Refresh the workspaces list since we've joined a new one
        await fetchWorkspaces()
        
        // Remove the invitation from pending list
        const { pendingInvitations } = get()
        const updatedPendingInvitations = pendingInvitations.filter(inv => inv.token !== token)
        set({ 
          pendingInvitations: updatedPendingInvitations,
          isLoadingInvitations: false
        })
      } else {
        set({ 
          invitationError: 'Failed to accept invitation',
          isLoadingInvitations: false
        })
      }
      
      return membership
    } catch (error) {
      console.error('[WorkspaceStore] Error accepting invitation:', error)
      set({
        invitationError: error instanceof Error ? error.message : 'Failed to accept invitation',
        isLoadingInvitations: false
      })
      return null
    }
  },
  
  declineInvitation: async (token) => {
    try {
      set({ isLoadingInvitations: true, invitationError: null })
      const success = await declineInvitationService(token)
      
      if (success) {
        // Remove the invitation from pending list
        const { pendingInvitations } = get()
        const updatedPendingInvitations = pendingInvitations.filter(inv => inv.token !== token)
        set({ 
          pendingInvitations: updatedPendingInvitations,
          isLoadingInvitations: false
        })
      } else {
        set({ 
          invitationError: 'Failed to decline invitation',
          isLoadingInvitations: false
        })
      }
      
      return success
    } catch (error) {
      console.error('[WorkspaceStore] Error declining invitation:', error)
      set({
        invitationError: error instanceof Error ? error.message : 'Failed to decline invitation',
        isLoadingInvitations: false
      })
      return false
    }
  },
  
  revokeInvitation: async (invitationId) => {
    try {
      set({ isLoadingInvitations: true, invitationError: null })
      const success = await revokeInvitationService(invitationId)
      
      if (success) {
        // Remove the invitation from sent invitations list
        const { sentInvitations } = get()
        const updatedSentInvitations = sentInvitations.filter(inv => inv.id !== invitationId)
        set({ 
          sentInvitations: updatedSentInvitations,
          isLoadingInvitations: false
        })
      } else {
        set({ 
          invitationError: 'Failed to revoke invitation',
          isLoadingInvitations: false
        })
      }
      
      return success
    } catch (error) {
      console.error('[WorkspaceStore] Error revoking invitation:', error)
      set({
        invitationError: error instanceof Error ? error.message : 'Failed to revoke invitation',
        isLoadingInvitations: false
      })
      return false
    }
  },
  
  clearInvitationError: () => {
    set({ invitationError: null })
  },
})
