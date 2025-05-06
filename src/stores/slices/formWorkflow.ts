"use client"

import { StateCreator } from 'zustand'
import type { FormWorkflowSlice } from '@/types/form-store-slices'
import type { FormBuilderState } from '@/types/store-types'
import type { Connection } from '@/types/workflow-types'

export const createFormWorkflowSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormWorkflowSlice
> = (set) => ({
  // State
  connections: [],
  
  // Actions
  setConnections: (connections: Connection[]) => set({ connections }),
  
  addConnection: (connection: Connection) => set((state) => ({
    connections: [...state.connections, connection]
  })),
  
  updateConnection: (connectionId: string, updates: Partial<Connection>) => set((state) => ({
    connections: state.connections.map(conn => 
      conn.id === connectionId ? { ...conn, ...updates } : conn
    )
  })),
  
  removeConnection: (connectionId: string) => set((state) => ({
    connections: state.connections.filter(conn => conn.id !== connectionId)
  }))
})
