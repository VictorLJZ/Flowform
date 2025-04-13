import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Workspace, WorkspaceInvitation, WorkspaceMember } from '@/types/supabase-types'
import { getUserWorkspaces } from '@/services/workspace/getUserWorkspaces'
import { createWorkspace as createWorkspaceService } from '@/services/workspace/createWorkspace'
import { initializeDefaultWorkspace } from '@/services/workspace/initializeDefaultWorkspace'
import { updateWorkspace as updateWorkspaceService } from '@/services/workspace/updateWorkspace'
import { deleteWorkspace as deleteWorkspaceService } from '@/services/workspace/deleteWorkspace'
import { leaveWorkspace as leaveWorkspaceService } from '@/services/workspace/leaveWorkspace'
import { acceptInvitation as acceptInvitationService } from '@/services/workspace/acceptInvitation'
import { declineInvitation as declineInvitationService } from '@/services/workspace/declineInvitation'
import { getPendingInvitations } from '@/services/workspace/getPendingInvitations'
import { getSentInvitations } from '@/services/workspace/getSentInvitations'
import { inviteToWorkspace } from '@/services/workspace/inviteToWorkspace'
import { resendInvitation as resendInvitationService } from '@/services/workspace/resendInvitation'
import { revokeInvitation as revokeInvitationService } from '@/services/workspace/revokeInvitation'

interface WorkspaceState {
  // Core Workspace State
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
  userId: string | null
  userEmail: string | null
  
  // Invitation State
  pendingInvitations: WorkspaceInvitation[]
  sentInvitations: WorkspaceInvitation[]
  isLoadingInvitations: boolean
  invitationError: string | null
  invitationLimit: number
  
  // Core Workspace Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void
  setUserId: (userId: string) => void
  setUserEmail: (email: string) => void
  fetchWorkspaces: () => Promise<void>
  createWorkspace: (name: string, description?: string) => Promise<Workspace>
  ensureDefaultWorkspace: () => Promise<void>
  renameWorkspace: (workspaceId: string, name: string) => Promise<void>
  leaveWorkspace: (workspaceId: string) => Promise<void>
  deleteWorkspace: (workspaceId: string) => Promise<void>
  
  // Invitation Actions
  fetchPendingInvitations: () => Promise<void>
  fetchSentInvitations: (workspaceId: string) => Promise<void>
  sendInvitations: (invites: { email: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }[]) => Promise<WorkspaceInvitation[]>
  resendInvitation: (invitationId: string) => Promise<WorkspaceInvitation | null>
  acceptInvitation: (token: string) => Promise<WorkspaceMember | null>
  declineInvitation: (token: string) => Promise<boolean>
  revokeInvitation: (invitationId: string) => Promise<boolean>
  clearInvitationError: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Core Workspace State
      currentWorkspace: null,
      workspaces: [],
      isLoading: false,
      error: null,
      userId: null,
      userEmail: null,
      
      // Invitation State
      pendingInvitations: [],
      sentInvitations: [],
      isLoadingInvitations: false,
      invitationError: null,
      invitationLimit: 50, // Default limit of 50 pending invitations per workspace

      setUserId: (userId) => {
        set({ userId })
      },
      
      setUserEmail: (email) => {
        set({ userEmail: email })
      },

      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace })
      },

      createWorkspace: async (name: string, description?: string) => {
        const { userId } = get()
        if (!userId) {
          throw new Error('User ID not set')
        }

        try {
          set({ isLoading: true, error: null })
          const workspace = await createWorkspaceService({
            name,
            description: description || null,
            created_by: userId,
            logo_url: null,
            settings: null
          })
          
          // Update workspaces list and set as current
          const { workspaces } = get()
          set({ 
            workspaces: [...workspaces, workspace],
            currentWorkspace: workspace,
            isLoading: false 
          })
          
          return workspace
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create workspace',
            isLoading: false 
          })
          throw error
        }
      },

      fetchWorkspaces: async () => {
        console.log('[WorkspaceStore] Starting fetchWorkspaces')
        const { userId } = get()
        console.log('[WorkspaceStore] Current userId:', userId)
        
        if (!userId) {
          console.log('[WorkspaceStore] No userId set, aborting fetchWorkspaces')
          set({ error: 'User ID not set', isLoading: false })
          return
        }

        try {
          console.log('[WorkspaceStore] Setting loading state, fetching workspaces')
          set({ isLoading: true, error: null })
          const workspaces = await getUserWorkspaces(userId)
          console.log('[WorkspaceStore] Received workspaces:', workspaces)
          set({ workspaces, isLoading: false })
          
          // Set current workspace if none selected
          const { currentWorkspace } = get()
          console.log('[WorkspaceStore] Current workspace:', currentWorkspace)
          if (!currentWorkspace && workspaces.length > 0) {
            console.log('[WorkspaceStore] Setting first workspace as current:', workspaces[0])
            set({ currentWorkspace: workspaces[0] })
          }
        } catch (error) {
          console.error('[WorkspaceStore] Error in fetchWorkspaces:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
            isLoading: false 
          })
        }
      },
      
      ensureDefaultWorkspace: async () => {
        console.log('[WorkspaceStore] Starting ensureDefaultWorkspace')
        const { userId } = get()
        console.log('[WorkspaceStore] Current userId for ensureDefaultWorkspace:', userId)
        
        if (!userId) {
          console.log('[WorkspaceStore] No userId set, aborting ensureDefaultWorkspace')
          set({ error: 'User ID not set' })
          return
        }
        
        try {
          console.log('[WorkspaceStore] Setting loading state, initializing default workspace')
          set({ isLoading: true, error: null })
          const defaultWorkspace = await initializeDefaultWorkspace(userId)
          console.log('[WorkspaceStore] Default workspace result:', defaultWorkspace)
          
          if (defaultWorkspace) {
            console.log('[WorkspaceStore] Default workspace created/found')
            // Set as current workspace if none is selected
            const { currentWorkspace, workspaces } = get()
            const updatedWorkspaces = [...workspaces]
            
            // Check if the workspace is already in the list
            const workspaceExists = workspaces.some(w => w.id === defaultWorkspace.id)
            if (!workspaceExists) {
              updatedWorkspaces.push(defaultWorkspace)
            }
            
            set({ 
              workspaces: updatedWorkspaces,
              currentWorkspace: currentWorkspace || defaultWorkspace,
              isLoading: false 
            })
          } else {
            console.log('[WorkspaceStore] No default workspace returned, might be an error')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('[WorkspaceStore] Error in ensureDefaultWorkspace:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize default workspace',
            isLoading: false
          })
        }
      },

      renameWorkspace: async (workspaceId: string, name: string) => {
        try {
          set({ isLoading: true, error: null })
          const updatedWorkspace = await updateWorkspaceService(workspaceId, { name })
          
          // Update workspaces in state
          const { workspaces, currentWorkspace } = get()
          const updatedWorkspaces = workspaces.map(workspace => 
            workspace.id === workspaceId ? updatedWorkspace : workspace
          )
          
          set({
            workspaces: updatedWorkspaces,
            currentWorkspace: currentWorkspace?.id === workspaceId 
              ? updatedWorkspace 
              : currentWorkspace,
            isLoading: false
          })
        } catch (error) {
          console.error('[WorkspaceStore] Error in renameWorkspace:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to rename workspace',
            isLoading: false
          })
          throw error
        }
      },
      
      leaveWorkspace: async (workspaceId: string) => {
        try {
          set({ isLoading: true, error: null })
          await leaveWorkspaceService(workspaceId)
          
          // Update state after leaving
          const { workspaces, currentWorkspace } = get()
          const updatedWorkspaces = workspaces.filter(workspace => workspace.id !== workspaceId)
          
          // Switch to another workspace if leaving the current one
          let newCurrentWorkspace = currentWorkspace
          if (currentWorkspace?.id === workspaceId) {
            newCurrentWorkspace = updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null
          }
          
          set({
            workspaces: updatedWorkspaces,
            currentWorkspace: newCurrentWorkspace,
            isLoading: false
          })
          
          // If no workspaces left, user might need a default one
          if (updatedWorkspaces.length === 0) {
            const { userId } = get()
            if (userId) {
              get().ensureDefaultWorkspace()
            }
          }
        } catch (error) {
          console.error('[WorkspaceStore] Error in leaveWorkspace:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to leave workspace',
            isLoading: false
          })
          throw error
        }
      },
      
      deleteWorkspace: async (workspaceId: string) => {
        try {
          set({ isLoading: true, error: null })
          await deleteWorkspaceService(workspaceId)
          
          // Update state after deletion
          const { workspaces, currentWorkspace } = get()
          const updatedWorkspaces = workspaces.filter(workspace => workspace.id !== workspaceId)
          
          // Switch to another workspace if deleting the current one
          let newCurrentWorkspace = currentWorkspace
          if (currentWorkspace?.id === workspaceId) {
            newCurrentWorkspace = updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null
          }
          
          set({
            workspaces: updatedWorkspaces,
            currentWorkspace: newCurrentWorkspace,
            isLoading: false
          })
          
          // If no workspaces left, user might need a default one
          if (updatedWorkspaces.length === 0) {
            const { userId } = get()
            if (userId) {
              get().ensureDefaultWorkspace()
            }
          }
        } catch (error) {
          console.error('[WorkspaceStore] Error in deleteWorkspace:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to delete workspace',
            isLoading: false
          })
          throw error
        }
      },
      
      // Invitation Management Actions
      fetchPendingInvitations: async () => {
        console.log('[WorkspaceStore] Starting fetchPendingInvitations')
        const { userEmail } = get()
        console.log('[WorkspaceStore] User email for pending invitations:', userEmail)
        
        if (!userEmail) {
          console.warn('[WorkspaceStore] Cannot fetch pending invitations: User email not set')
          set({ invitationError: 'User email not set' })
          return
        }
        
        try {
          console.log('[WorkspaceStore] Setting loading state for pending invitations')
          set({ isLoadingInvitations: true, invitationError: null })
          
          console.log('[WorkspaceStore] Calling getPendingInvitations service with email:', userEmail)
          const pendingInvitations = await getPendingInvitations(userEmail)
          console.log('[WorkspaceStore] Received pending invitations:', pendingInvitations.length)
          
          set({ pendingInvitations, isLoadingInvitations: false })
          console.log('[WorkspaceStore] Updated store with pending invitations')
        } catch (error) {
          console.error('[WorkspaceStore] Error fetching pending invitations:', error)
          if (error instanceof Error) {
            console.error('[WorkspaceStore] Error message:', error.message)
            console.error('[WorkspaceStore] Error stack:', error.stack)
          } else {
            console.error('[WorkspaceStore] Unknown error type:', typeof error)
          }
          
          set({
            invitationError: error instanceof Error ? error.message : 'Failed to fetch invitations',
            isLoadingInvitations: false
          })
        }
      },
      
      fetchSentInvitations: async (workspaceId: string) => {
        console.log('[WorkspaceStore] Starting fetchSentInvitations with workspaceId:', workspaceId)
        
        if (!workspaceId) {
          console.warn('[WorkspaceStore] Cannot fetch sent invitations: workspaceId is empty')
          set({ invitationError: 'Workspace ID not provided' })
          return
        }
        
        try {
          console.log('[WorkspaceStore] Setting loading state for sent invitations')
          set({ isLoadingInvitations: true, invitationError: null })
          
          console.log('[WorkspaceStore] Calling getSentInvitations service')
          const sentInvitations = await getSentInvitations(workspaceId)
          console.log('[WorkspaceStore] Received sent invitations, count:', sentInvitations.length)
          
          set({ sentInvitations, isLoadingInvitations: false })
          console.log('[WorkspaceStore] Updated store with sent invitations')
        } catch (error) {
          console.error('[WorkspaceStore] Error fetching sent invitations:', error)
          if (error instanceof Error) {
            console.error('[WorkspaceStore] Error details:', { 
              message: error.message, 
              name: error.name,
              stack: error.stack
            })
          }
          
          set({
            invitationError: error instanceof Error ? error.message : 'Failed to fetch sent invitations',
            isLoadingInvitations: false
          })
        }
      },
      
      sendInvitations: async (invites) => {
        console.log('[WorkspaceStore] Starting sendInvitations with invites:', invites.length)
        const { currentWorkspace, userId, sentInvitations, invitationLimit } = get()
        
        console.log('[WorkspaceStore] Current state:', { 
          workspaceId: currentWorkspace?.id,
          userId, 
          sentInvitationsCount: sentInvitations.length 
        })
        
        if (!currentWorkspace) {
          console.error('[WorkspaceStore] No current workspace selected')
          throw new Error('No current workspace selected')
        }
        
        if (!userId) {
          console.error('[WorkspaceStore] User ID not set')
          throw new Error('User ID not set')
        }
        
        // Check if we've hit the invitation limit
        const pendingInvitationCount = sentInvitations.filter(inv => inv.status === 'pending').length
        console.log('[WorkspaceStore] Current pending invitations:', pendingInvitationCount, 'of', invitationLimit, 'limit')
        
        if (pendingInvitationCount + invites.length > invitationLimit) {
          const errorMessage = `Cannot send more than ${invitationLimit} pending invitations for a workspace`
          console.error('[WorkspaceStore]', errorMessage)
          throw new Error(errorMessage)
        }
        
        try {
          console.log('[WorkspaceStore] Setting loading state for sending invitations')
          set({ isLoadingInvitations: true, invitationError: null })
          
          // Process each invitation in sequence
          console.log('[WorkspaceStore] Processing', invites.length, 'invitations')
          const createdInvitations: WorkspaceInvitation[] = []
          
          for (let i = 0; i < invites.length; i++) {
            const invite = invites[i]
            console.log(`[WorkspaceStore] Processing invitation ${i + 1}/${invites.length} for email:`, invite.email)
            
            try {
              const invitation = await inviteToWorkspace(
                currentWorkspace.id,
                invite.email,
                invite.role,
                userId
              )
              
              console.log('[WorkspaceStore] Successfully created invitation with ID:', invitation.id)
              createdInvitations.push(invitation)
            } catch (inviteError) {
              console.error(`[WorkspaceStore] Error creating invitation ${i + 1}:`, inviteError)
              throw inviteError
            }
          }
          
          console.log('[WorkspaceStore] All invitations processed, updating store')
          
          // Update the sent invitations list
          const updatedSentInvitations = [...sentInvitations, ...createdInvitations]
          set({ 
            sentInvitations: updatedSentInvitations,
            isLoadingInvitations: false
          })
          
          console.log('[WorkspaceStore] Store updated with new invitations')
          return createdInvitations
        } catch (error) {
          console.error('[WorkspaceStore] Error sending invitations:', error)
          if (error instanceof Error) {
            console.error('[WorkspaceStore] Error details:', { 
              message: error.message, 
              name: error.name,
              stack: error.stack
            })
          }
          
          set({
            invitationError: error instanceof Error ? error.message : 'Failed to send invitations',
            isLoadingInvitations: false
          })
          throw error
        }
      },
      
      resendInvitation: async (invitationId: string) => {
        try {
          set({ isLoadingInvitations: true, invitationError: null })
          const updatedInvitation = await resendInvitationService(invitationId)
          
          if (updatedInvitation) {
            // Update the invitation in the sent invitations list
            const { sentInvitations } = get()
            const updatedSentInvitations = sentInvitations.map(inv => 
              inv.id === invitationId ? updatedInvitation : inv
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
          
          return updatedInvitation
        } catch (error) {
          console.error('[WorkspaceStore] Error resending invitation:', error)
          set({
            invitationError: error instanceof Error ? error.message : 'Failed to resend invitation',
            isLoadingInvitations: false
          })
          return null
        }
      },
      
      acceptInvitation: async (token: string) => {
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
      
      declineInvitation: async (token: string) => {
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
      
      revokeInvitation: async (invitationId: string) => {
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
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ 
        currentWorkspace: state.currentWorkspace,
        userId: state.userId,
        userEmail: state.userEmail
      }),
    }
  )
) 