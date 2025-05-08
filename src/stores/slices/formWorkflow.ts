"use client"

import { StateCreator } from 'zustand'
import type { FormWorkflowSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import type { Connection } from '@/types/workflow-types'
import type { Node, Edge } from 'reactflow'
import { createDefaultConnections } from '@/utils/workflow/autoConnectBlocks'

export const createFormWorkflowSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormWorkflowSlice
> = (set, get) => ({
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
  
  // Block observation methods - these are called when blocks change
  onBlockAdded: (blockId: string) => {
    // Called when a new block is added
    console.log(`🔍🔄 [WorkflowSlice] onBlockAdded called for blockId: ${blockId}`);
    
    // Create default connections based on the block's position
    const { blocks, connections } = get();
    
    console.log(`🔍🔄 [WorkflowSlice] Current state: ${blocks.length} blocks, ${connections.length} connections`);
    
    // Find the block that was just added
    const addedBlock = blocks.find(block => block.id === blockId);
    if (!addedBlock) {
      console.error(`🚨🚨 [WorkflowSlice] Block with id ${blockId} not found in blocks array!`);
      return;
    }
    
    console.log(`🔍🔄 [WorkflowSlice] Found block: ${addedBlock.title || 'Untitled'} (${addedBlock.id}) at order_index ${addedBlock.order_index}`);
    
    // Create default connections for the new block
    const newConnections = createDefaultConnections({
      blocks,
      connections,
      targetBlockId: blockId
    });
    
    // Add all new connections
    if (newConnections.length > 0) {
      console.log(`✅✅ [WorkflowSlice] Creating ${newConnections.length} default connections for block ${blockId}:`);
      newConnections.forEach((conn, idx) => {
        console.log(`  📌📌 [${idx + 1}] ${conn.sourceId} --> ${conn.targetId} (${conn.conditionType})`);
      });
      
      set(state => ({
        connections: [...state.connections, ...newConnections]
      }));
      
      // Verify connections were added
      setTimeout(() => {
        const updatedConnections = get().connections;
        console.log(`🔍🔄 [WorkflowSlice] After update: ${updatedConnections.length} total connections`);
      }, 0);
    } else {
      console.log(`⚠️⚠️ [WorkflowSlice] No default connections needed for block ${blockId}`);
    }
  },
  
  onBlockRemoved: (blockId: string) => {
    // Called when a block is removed
    // Clean up any connections involving this block
    const { connections } = get()
    
    // Filter out connections involving the removed block
    const validConnections = connections.filter(conn => 
      conn.sourceId !== blockId && conn.targetId !== blockId
    )
    
    // Only update if connections changed
    if (validConnections.length !== connections.length) {
      console.log(`Cleaning up ${connections.length - validConnections.length} connections for removed block ${blockId}`)
      set({ connections: validConnections })
    }
  },
  
  onBlocksReordered: (movedBlockId: string) => {
    // Called when blocks are reordered
    console.log(`🔍🔄 [WorkflowSlice] onBlocksReordered called for blockId: ${movedBlockId}`);
    
    // Create default connections for the moved block based on its new position
    const { blocks, connections } = get();
    
    console.log(`🔍🔄 [WorkflowSlice] Current state: ${blocks.length} blocks, ${connections.length} connections`);
    
    // Find the moved block
    const movedBlock = blocks.find(block => block.id === movedBlockId);
    if (!movedBlock) {
      console.error(`🚨🚨 [WorkflowSlice] Block with id ${movedBlockId} not found in blocks array!`);
      return;
    }
    
    console.log(`🔍🔄 [WorkflowSlice] Found moved block: ${movedBlock.title || 'Untitled'} (${movedBlock.id}) at new order_index ${movedBlock.order_index}`);
    
    // Create default connections for the moved block
    const newConnections = createDefaultConnections({
      blocks,
      connections,
      targetBlockId: movedBlockId
    });
    
    if (newConnections.length > 0) {
      console.log(`✅✅ [WorkflowSlice] Creating ${newConnections.length} default connections for moved block ${movedBlockId}:`);
      newConnections.forEach((conn, idx) => {
        console.log(`  📌📌 [${idx + 1}] ${conn.sourceId} --> ${conn.targetId} (${conn.conditionType})`);
      });
      
      set(state => ({
        connections: [...state.connections, ...newConnections]
      }));
      
      // Verify connections were added
      setTimeout(() => {
        const updatedConnections = get().connections;
        console.log(`🔍🔄 [WorkflowSlice] After reorder update: ${updatedConnections.length} total connections`);
      }, 0);
    } else {
      console.log(`⚠️⚠️ [WorkflowSlice] No changes needed for connections after reordering block ${movedBlockId}`);
    }
  },
  
  // Utility method to validate all connections
  validateConnections: () => {
    const { connections } = get()
    const { blocks } = get() as unknown as FormBuilderState
    
    // Check for connections with missing blocks
    const validConnections = connections.filter(conn => {
      const sourceExists = blocks.some(block => block.id === conn.sourceId)
      const targetExists = blocks.some(block => block.id === conn.targetId)
      return sourceExists && targetExists
    })
    
    // Only update if connections changed
    if (validConnections.length !== connections.length) {
      console.log(`Removed ${connections.length - validConnections.length} invalid connections`)
      set({ connections: validConnections })
    }
    
    return validConnections.length === connections.length
  },
  
  // Sync actions
  syncBlockOrderWithConnections: () => {
    // This method reorders blocks based on the workflow graph
    // It's used when we want the block order to follow the workflow
    console.log('Synchronizing block order with workflow connections')
    
    const { connections } = get()
    const { blocks } = get() as unknown as FormBuilderState
    const { updateBlock } = get() as unknown as FormBuilderState
    
    if (!connections.length || !blocks.length) return
    
    try {
      // Build a directed graph from connections
      const graph: Record<string, string[]> = {}
      
      // Initialize graph with all blocks (including those with no connections)
      blocks.forEach(block => {
        graph[block.id] = []
      })
      
      // Add edges to the graph
      connections.forEach(conn => {
        if (graph[conn.sourceId]) {
          graph[conn.sourceId].push(conn.targetId)
        }
      })
      
      // Find start nodes (blocks with no incoming connections)
      const hasIncoming = new Set<string>()
      Object.values(graph).forEach(targets => {
        targets.forEach(target => hasIncoming.add(target))
      })
      
      const startNodes = blocks
        .filter(block => !hasIncoming.has(block.id))
        .map(block => block.id)
      
      if (!startNodes.length && blocks.length > 0) {
        // If no start nodes found, use the first block
        startNodes.push(blocks[0].id)
      }
      
      // Perform a topological sort (modified BFS)
      const visited = new Set<string>()
      const ordered: string[] = []
      const queue = [...startNodes]
      
      while (queue.length > 0) {
        const current = queue.shift()!
        
        if (visited.has(current)) continue
        visited.add(current)
        ordered.push(current)
        
        // Add unvisited neighbors to the queue
        const neighbors = graph[current] || []
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
      
      // Add any remaining blocks that weren't reached by the graph traversal
      blocks.forEach(block => {
        if (!visited.has(block.id)) {
          ordered.push(block.id)
        }
      })
      
      // Update block order_index based on the sorted order
      ordered.forEach((blockId, index) => {
        if (typeof updateBlock === 'function') {
          updateBlock(blockId, { order_index: index })
        }
      })
      
      console.log(`Synchronized block order based on workflow: ${ordered.join(' -> ')}`)
    } catch (error) {
      console.error('Error synchronizing block order with connections:', error)
    }
    
    // Return the current state
    return set(state => state)
  }
})
