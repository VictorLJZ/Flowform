"use client"

import { StateCreator } from 'zustand'
import type { FormWorkflowSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import type { Connection } from '@/types/workflow-types'
import type { Node, Edge } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

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
    // Ensure connection has required fields
    const validConnection = {
      ...connection,
      rules: connection.rules || [] // Ensure rules array exists
    };
    
    set((state) => ({
      connections: [...state.connections, validConnection]
    }))
    return validConnection.id;
  },
  
  updateConnection: (connectionId: string, updates: Partial<Connection>) => set((state) => ({
    connections: state.connections.map(conn => 
      conn.id === connectionId ? { ...conn, ...updates } : conn
    )
  })),
  
  removeConnection: (connectionId: string) => set((state) => ({
    connections: state.connections.filter(conn => conn.id !== connectionId)
  })),
  
  updateConnectionTarget: (connectionId: string, newTargetId: string) => {
    // Get current state
    const state = get();
    const { connections } = state;
    
    // Find the connection to update
    const connectionToUpdate = connections.find(conn => conn.id === connectionId);
    if (!connectionToUpdate) {
      console.error(`Connection with ID ${connectionId} not found`);
      return false;
    }
    
    // Get the current target
    const oldTargetId = connectionToUpdate.defaultTargetId;
    
    // Create a preview of the new connections state after the update
    const updatedConnections = connections.map(conn => 
      conn.id === connectionId ? { ...conn, defaultTargetId: newTargetId } : conn
    );
    
    // Check if this change would orphan the old target
    const oldTargetIncoming = updatedConnections.filter(conn => conn.defaultTargetId === oldTargetId).length;
    const oldTargetOutgoing = updatedConnections.filter(conn => conn.sourceId === oldTargetId).length;
    let oldTargetInRules = false;
    
    // Also check rules targets
    updatedConnections.forEach(conn => {
      if (conn.rules && conn.rules.length > 0) {
        if (conn.rules.some(rule => rule.target_block_id === oldTargetId)) {
          oldTargetInRules = true;
        }
      }
    });
    
    // If the old target would be orphaned by this change, prevent it
    if (oldTargetIncoming === 0 && oldTargetOutgoing === 0 && !oldTargetInRules) {
      console.error('Cannot update connection target: would create an orphaned node');
      return false;
    }
    
    // Apply the change
    console.log(`Updating connection ${connectionId} default target from ${oldTargetId} to ${newTargetId}`);
    set({ 
      connections: updatedConnections 
    });
    
    return true;
  },
  
  // Block observation methods - these are called when blocks change
  onBlockAdded: (blockId: string) => {
    const { connections, blocks, addConnection } = get();
    const newBlock = blocks.find(b => b.id === blockId);

    if (!newBlock) {
      console.error(`[onBlockAdded] New block with ID ${blockId} not found in state.`);
      return;
    }

    const isFirstBlock = blocks.length === 1 && blocks[0].id === blockId;
    const hasIncomingConnections = connections.some(conn => 
        conn.defaultTargetId === blockId || 
        (conn.rules && conn.rules.some(rule => rule.target_block_id === blockId))
    );

    if (!isFirstBlock && !hasIncomingConnections) {
      const sortedBlocks = [...blocks].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      const newBlockIndex = sortedBlocks.findIndex(b => b.id === blockId);
      
      if (newBlockIndex > 0) {
        const prevBlock = sortedBlocks[newBlockIndex - 1];
        if (prevBlock && prevBlock.id !== blockId) {
          const existingConnection = connections.find(conn => 
            conn.sourceId === prevBlock.id && conn.defaultTargetId === blockId
          );

          if (!existingConnection) {
            console.log(`[onBlockAdded] Auto-connecting previous block ${prevBlock.id} to new block ${blockId}`);
            const newConnection: Connection = {
              id: uuidv4(),
              sourceId: prevBlock.id,
              defaultTargetId: blockId,
              rules: [],
              order_index: connections.length
            };
            addConnection(newConnection);
          }
        }
      }
    }
    get().validateConnections(); // Validate after potential changes
  },

  onBlockRemoved: (blockId: string) => {
    const { connections, nodePositions } = get();
    const validConnections = connections.filter(conn => 
      conn.sourceId !== blockId && conn.defaultTargetId !== blockId && 
      (conn.rules ? conn.rules.every(rule => rule.target_block_id !== blockId) : true)
    );

    const newNodePositions = { ...nodePositions };
    delete newNodePositions[blockId];

    if (validConnections.length !== connections.length || !(blockId in nodePositions)) {
      console.log(`[onBlockRemoved] Cleaned up for block ${blockId}. Connections: ${validConnections.length}, Node Positions: ${Object.keys(newNodePositions).length}`);
      set({ connections: validConnections, nodePositions: newNodePositions });
    }
    get().validateConnections(); // Validate after potential changes
  },
  
  onBlocksReordered: (movedBlockId: string) => {
    console.log(`[onBlocksReordered] Reordered block ${movedBlockId}`);
    const { connections, blocks, addConnection } = get();
    const movedBlock = blocks.find(block => block.id === movedBlockId);

    if (!movedBlock) {
      console.error(`[onBlocksReordered] Block with id ${movedBlockId} not found!`);
      return;
    }

    const sortedBlocks = [...blocks].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    const movedBlockIndex = sortedBlocks.findIndex(b => b.id === movedBlockId);

    // 1. Connect from PREVIOUS block to MOVED block
    if (movedBlockIndex > 0) {
      const prevBlockInOrder = sortedBlocks[movedBlockIndex - 1];
      if (prevBlockInOrder && prevBlockInOrder.id !== movedBlock.id) {
        const existingConnection = connections.find(conn => conn.sourceId === prevBlockInOrder.id && conn.defaultTargetId === movedBlock.id);
        if (!existingConnection) {
          console.log(`[onBlocksReordered] Auto-connecting ${prevBlockInOrder.id} to ${movedBlock.id}`);
          addConnection({
            id: uuidv4(),
            sourceId: prevBlockInOrder.id,
            defaultTargetId: movedBlock.id,
            rules: [],
            order_index: connections.length
          });
        }
      }
    }

    // 2. Connect from MOVED block to NEXT block
    if (movedBlockIndex < sortedBlocks.length - 1) {
      const nextBlockInOrder = sortedBlocks[movedBlockIndex + 1];
      if (nextBlockInOrder && nextBlockInOrder.id !== movedBlock.id) {
        const existingConnection = connections.find(conn => conn.sourceId === movedBlock.id && conn.defaultTargetId === nextBlockInOrder.id);
        if (!existingConnection) {
          console.log(`[onBlocksReordered] Auto-connecting ${movedBlock.id} to ${nextBlockInOrder.id}`);
          addConnection({
            id: uuidv4(),
            sourceId: movedBlock.id,
            defaultTargetId: nextBlockInOrder.id,
            rules: [],
            order_index: connections.length
          });
        }
      }
    }
    get().validateConnections(); // Validate after potential changes
  },

  // Utility method to validate all connections
  validateConnections: () => {
    const { connections } = get()
    const { blocks } = get() as unknown as FormBuilderState
    
    // Check for connections with missing blocks
    const validConnections = connections.filter(conn => {
      const sourceExists = blocks.some(block => block.id === conn.sourceId);
      const defaultTargetExists = blocks.some(block => block.id === conn.defaultTargetId);
      
      // If source or default target doesn't exist, the connection is invalid
      if (!sourceExists || !defaultTargetExists) {
        return false;
      }
      
      // Validate rule targets if there are any rules
      if (conn.rules && conn.rules.length > 0) {
        // Filter rules with valid targets
        conn.rules = conn.rules.filter(rule => 
          blocks.some(block => block.id === rule.target_block_id)
        );
      }
      
      return true;
    });
    
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
      
      // Add edges to the graph from both default targets and rule targets
      connections.forEach(conn => {
        if (graph[conn.sourceId]) {
          // Add default target
          if (conn.defaultTargetId !== null) { 
            graph[conn.sourceId].push(conn.defaultTargetId);
          }
          
          // Add rule targets
          if (conn.rules && conn.rules.length > 0) {
            conn.rules.forEach(rule => {
              if (rule.target_block_id) {
                graph[conn.sourceId].push(rule.target_block_id);
              }
            });
          }
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
