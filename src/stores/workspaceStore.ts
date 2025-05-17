/**
 * Workspace Store
 * 
 * A comprehensive store for managing workspaces, members, and invitations.
 * Following our three-layer type system architecture:
 * - Stores API types internally
 * - UI components should transform to UI types as needed
 * - API types are transformed to DB types by the service layer
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WorkspaceState } from '@/types/store-types';
import {
  ApiWorkspace,
  ApiWorkspaceInput,
  ApiWorkspaceUpdateInput,
  ApiWorkspaceMemberWithProfile,
  ApiWorkspaceRole,
  ApiWorkspaceInvitation,
  ApiWorkspaceInvitationInput
} from '@/types/workspace/ApiWorkspace';

// Import client services
import {
  getUserWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} from '@/services/workspace/client/workspaces.client';

import {
  getWorkspaceMembers,
  updateMemberRole,
  removeWorkspaceMember,
  leaveWorkspace
} from '@/services/workspace/client/members.client';

import {
  getWorkspaceInvitations,
  createInvitation,
  deleteInvitation
} from '@/services/workspace/client/invitations.client';

/**
 * Create the workspace store with full CRUD operations
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  // Persist essential state in localStorage for cross-session retention
  persist(
    (set, get) => ({
      // Workspace State
      workspaces: [],
      currentWorkspaceId: null,
      lastSelectionTime: 0,
      isLoading: false,
      error: null,
      
      // Members State
      members: {},
      membersLoading: {},
      membersError: {},
      
      // Invitations State
      invitations: {},
      invitationsLoading: {},
      invitationsError: {},
      
      // ==============================================
      // Workspace Actions
      // ==============================================
      
      /**
       * Fetch all workspaces for the current user
       */
      fetchWorkspaces: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const workspaces = await getUserWorkspaces();
          set({ workspaces, isLoading: false });
          return workspaces;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workspaces';
          set({ error: errorMessage, isLoading: false });
          return [];
        }
      },
      
      /**
       * Select a workspace and record the selection time
       */
      selectWorkspace: (workspaceId: string | null) => {
        set({
          currentWorkspaceId: workspaceId,
          lastSelectionTime: Date.now()
        });
        
        // If a workspace is selected, fetch its members and invitations
        if (workspaceId) {
          const state = get();
          if (!state.members[workspaceId]) {
            state.fetchMembers(workspaceId);
          }
          if (!state.invitations[workspaceId]) {
            state.fetchInvitations(workspaceId);
          }
        }
      },
      
      /**
       * Create a new workspace
       */
      createWorkspace: async (input: ApiWorkspaceInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const workspace = await createWorkspace(input);
          
          // Update state with the new workspace
          set(state => ({
            workspaces: [...state.workspaces, workspace],
            isLoading: false
          }));
          
          return workspace;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create workspace';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      /**
       * Update an existing workspace
       */
      updateWorkspace: async (id: string, input: ApiWorkspaceUpdateInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedWorkspace = await updateWorkspace(id, input);
          
          // Update state with the updated workspace
          set(state => ({
            workspaces: state.workspaces.map(w => 
              w.id === id ? updatedWorkspace : w
            ),
            isLoading: false
          }));
          
          return updatedWorkspace;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update workspace';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      /**
       * Delete a workspace
       */
      deleteWorkspace: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await deleteWorkspace(id);
          
          // Update state by filtering out the deleted workspace
          set(state => {
            // Clear the current selection if it's the deleted workspace
            const newCurrentId = 
              state.currentWorkspaceId === id ? null : state.currentWorkspaceId;
              
            // Clean up associated members and invitations
            const { [id]: _, ...remainingMembers } = state.members;
            const { [id]: __, ...remainingInvitations } = state.invitations;
            
            return {
              workspaces: state.workspaces.filter(w => w.id !== id),
              currentWorkspaceId: newCurrentId,
              members: remainingMembers,
              invitations: remainingInvitations,
              isLoading: false
            };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete workspace';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      // ==============================================
      // Member Actions
      // ==============================================
      
      /**
       * Fetch members for a specific workspace
       */
      fetchMembers: async (workspaceId: string) => {
        set(state => ({
          membersLoading: { ...state.membersLoading, [workspaceId]: true },
          membersError: { ...state.membersError, [workspaceId]: null }
        }));
        
        try {
          const members = await getWorkspaceMembers(workspaceId);
          
          set(state => ({
            members: { ...state.members, [workspaceId]: members },
            membersLoading: { ...state.membersLoading, [workspaceId]: false }
          }));
          
          return members;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch members';
          
          set(state => ({
            membersError: { ...state.membersError, [workspaceId]: errorMessage },
            membersLoading: { ...state.membersLoading, [workspaceId]: false }
          }));
          
          return [];
        }
      },
      
      /**
       * Update a member's role
       */
      updateMemberRole: async (workspaceId: string, userId: string, role: ApiWorkspaceRole) => {
        set(state => ({
          membersLoading: { ...state.membersLoading, [workspaceId]: true },
          membersError: { ...state.membersError, [workspaceId]: null }
        }));
        
        try {
          await updateMemberRole(workspaceId, userId, role);
          
          // Update the member in the state
          set(state => {
            const workspaceMembers = state.members[workspaceId] || [];
            const updatedMembers = workspaceMembers.map(member => 
              member.userId === userId ? { ...member, role } : member
            );
            
            return {
              members: { ...state.members, [workspaceId]: updatedMembers },
              membersLoading: { ...state.membersLoading, [workspaceId]: false }
            };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update member role';
          
          set(state => ({
            membersError: { ...state.membersError, [workspaceId]: errorMessage },
            membersLoading: { ...state.membersLoading, [workspaceId]: false }
          }));
          
          throw error;
        }
      },
      
      /**
       * Remove a member from a workspace
       */
      removeMember: async (workspaceId: string, userId: string) => {
        set(state => ({
          membersLoading: { ...state.membersLoading, [workspaceId]: true },
          membersError: { ...state.membersError, [workspaceId]: null }
        }));
        
        try {
          await removeWorkspaceMember(workspaceId, userId);
          
          // Remove the member from the state
          set(state => {
            const workspaceMembers = state.members[workspaceId] || [];
            const updatedMembers = workspaceMembers.filter(member => 
              member.userId !== userId
            );
            
            return {
              members: { ...state.members, [workspaceId]: updatedMembers },
              membersLoading: { ...state.membersLoading, [workspaceId]: false }
            };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
          
          set(state => ({
            membersError: { ...state.membersError, [workspaceId]: errorMessage },
            membersLoading: { ...state.membersLoading, [workspaceId]: false }
          }));
          
          throw error;
        }
      },
      
      /**
       * Leave a workspace (current user removes themselves)
       */
      leaveWorkspace: async (workspaceId: string) => {
        set(state => ({
          membersLoading: { ...state.membersLoading, [workspaceId]: true },
          membersError: { ...state.membersError, [workspaceId]: null }
        }));
        
        try {
          const result = await leaveWorkspace(workspaceId);
          
          // If the workspace was deleted (last owner left), remove it from state
          if (result.isWorkspaceDeleted) {
            set(state => {
              // Clean up the workspace and associated data
              const { [workspaceId]: _, ...remainingMembers } = state.members;
              const { [workspaceId]: __, ...remainingInvitations } = state.invitations;
              
              return {
                workspaces: state.workspaces.filter(w => w.id !== workspaceId),
                currentWorkspaceId: state.currentWorkspaceId === workspaceId ? null : state.currentWorkspaceId,
                members: remainingMembers,
                invitations: remainingInvitations,
                membersLoading: { ...state.membersLoading, [workspaceId]: false }
              };
            });
          } else {
            // Just update the loading state if we're still keeping the workspace
            set(state => ({
              membersLoading: { ...state.membersLoading, [workspaceId]: false }
            }));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to leave workspace';
          
          set(state => ({
            membersError: { ...state.membersError, [workspaceId]: errorMessage },
            membersLoading: { ...state.membersLoading, [workspaceId]: false }
          }));
          
          throw error;
        }
      },
      
      // ==============================================
      // Invitation Actions
      // ==============================================
      
      /**
       * Fetch invitations for a specific workspace
       */
      fetchInvitations: async (workspaceId: string) => {
        set(state => ({
          invitationsLoading: { ...state.invitationsLoading, [workspaceId]: true },
          invitationsError: { ...state.invitationsError, [workspaceId]: null }
        }));
        
        try {
          const invitations = await getWorkspaceInvitations(workspaceId);
          
          set(state => ({
            invitations: { ...state.invitations, [workspaceId]: invitations },
            invitationsLoading: { ...state.invitationsLoading, [workspaceId]: false }
          }));
          
          return invitations;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch invitations';
          
          set(state => ({
            invitationsError: { ...state.invitationsError, [workspaceId]: errorMessage },
            invitationsLoading: { ...state.invitationsLoading, [workspaceId]: false }
          }));
          
          return [];
        }
      },
      
      /**
       * Create a new invitation
       */
      createInvitation: async (workspaceId: string, input: ApiWorkspaceInvitationInput) => {
        set(state => ({
          invitationsLoading: { ...state.invitationsLoading, [workspaceId]: true },
          invitationsError: { ...state.invitationsError, [workspaceId]: null }
        }));
        
        try {
          const invitation = await createInvitation(workspaceId, input);
          
          // Add the new invitation to state
          set(state => {
            const workspaceInvitations = state.invitations[workspaceId] || [];
            return {
              invitations: { 
                ...state.invitations, 
                [workspaceId]: [...workspaceInvitations, invitation] 
              },
              invitationsLoading: { ...state.invitationsLoading, [workspaceId]: false }
            };
          });
          
          return invitation;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create invitation';
          
          set(state => ({
            invitationsError: { ...state.invitationsError, [workspaceId]: errorMessage },
            invitationsLoading: { ...state.invitationsLoading, [workspaceId]: false }
          }));
          
          throw error;
        }
      },
      
      /**
       * Delete an invitation
       */
      deleteInvitation: async (workspaceId: string, invitationId: string) => {
        set(state => ({
          invitationsLoading: { ...state.invitationsLoading, [workspaceId]: true },
          invitationsError: { ...state.invitationsError, [workspaceId]: null }
        }));
        
        try {
          await deleteInvitation(workspaceId, invitationId);
          
          // Remove the invitation from state
          set(state => {
            const workspaceInvitations = state.invitations[workspaceId] || [];
            const updatedInvitations = workspaceInvitations.filter(invitation => 
              invitation.id !== invitationId
            );
            
            return {
              invitations: { ...state.invitations, [workspaceId]: updatedInvitations },
              invitationsLoading: { ...state.invitationsLoading, [workspaceId]: false }
            };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete invitation';
          
          set(state => ({
            invitationsError: { ...state.invitationsError, [workspaceId]: errorMessage },
            invitationsLoading: { ...state.invitationsLoading, [workspaceId]: false }
          }));
          
          throw error;
        }
      }
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => localStorage),
      
      // Only persist these keys (not everything)
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
        lastSelectionTime: state.lastSelectionTime
      }),
    }
  )
);
