"use client"

import { createContext, useContext, ReactNode } from 'react'

// In a real app, this would come from a proper auth hook
// For now, we'll use placeholder UUIDs for development
const DEFAULT_WORKSPACE_ID = '00000000-0000-0000-0000-000000000000'
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

type WorkspaceContextType = {
  currentWorkspaceId: string
  currentUserId: string
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // In a real app, this would pull from auth context or user preferences
  const currentWorkspaceId = DEFAULT_WORKSPACE_ID
  const currentUserId = DEFAULT_USER_ID
  
  return (
    <WorkspaceContext.Provider value={{ currentWorkspaceId, currentUserId }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
