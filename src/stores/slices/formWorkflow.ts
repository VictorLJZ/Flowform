"use client"

import { StateCreator } from 'zustand'
import type { FormWorkflowSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import type { Connection } from '@/types/workflow-types'
import type { Node, Edge } from 'reactflow'

export const createFormWorkflowSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormWorkflowSlice
> = (set) => ({
  // Core data
  connections: [],
  nodePositions: {},
  
  // UI state
  selectedElementId: null,
  isConnecting: false,
  sourceNodeId: null,
  targetNodeId: null,
  
  // ReactFlow state
  nodes: [] as Node[],
  edges: [] as Edge[],
  
  // Selection actions
  selectElement: (elementId: string | null) => set({ selectedElementId: elementId }),
  
  // Connection mode actions
  setConnectingMode: (isConnecting: boolean, sourceId: string | null = null) => set({
    isConnecting,
    sourceNodeId: sourceId
  }),
  
  setIsConnecting: (isConnecting: boolean) => set({ isConnecting }),
  setSourceNodeId: (nodeId: string | null) => set({ sourceNodeId: nodeId }),
  setTargetNodeId: (nodeId: string | null) => set({ targetNodeId: nodeId }),
  
  // Node position actions
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => set(state => ({
    nodePositions: {
      ...state.nodePositions,
      [nodeId]: position
    }
  })),
  
  updateNodePositions: (positions: Record<string, { x: number; y: number }>) => set(state => ({
    nodePositions: {
      ...state.nodePositions,
      ...positions
    }
  })),
  
  // ReactFlow actions
  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
  
  // Connection actions
  setConnections: (connections: Connection[]) => set({ connections }),
  
  addConnection: (connection: Connection) => {
    set((state) => ({
      connections: [...state.connections, connection]
    }))
    return connection.id; // Return the connection ID as required by the interface
  },
  
  updateConnection: (connectionId: string, updates: Partial<Connection>) => set((state) => ({
    connections: state.connections.map(conn => 
      conn.id === connectionId ? { ...conn, ...updates } : conn
    )
  })),
  
  removeConnection: (connectionId: string) => set((state) => ({
    connections: state.connections.filter(conn => conn.id !== connectionId)
  })),
  
  // Sync actions
  syncBlockOrderWithConnections: () => {
    // This method will be implemented to synchronize block order with workflow connections
    // For now, leaving it as a placeholder to satisfy the interface
    set(state => state)
  }
})
