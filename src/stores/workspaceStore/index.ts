import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WorkspaceStore } from '@/types/store-types'
import { createCoreSlice } from './coreSlice'
import { createMembershipSlice } from './membershipSlice'
import { createInvitationSlice } from './invitationSlice'

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (...args) => ({
      ...createCoreSlice(...args),
      ...createMembershipSlice(...args),
      ...createInvitationSlice(...args),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        workspaces: state.workspaces,   // Save all workspaces to localStorage
        userId: state.userId,
        userEmail: state.userEmail
      }),
    }
  )
)
