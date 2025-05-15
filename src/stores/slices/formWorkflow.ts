"use client"

import { StateCreator } from 'zustand'
import type { FormWorkflowSlice } from '@/types/form-store-slices-types'
import type { FormBuilderState } from '@/types/store-types'
import type { Connection } from '@/types/workflow-types'
import type { Node, Edge } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'
import { createDefaultConnections } from '../../utils/workflow/autoConnectBlocks';
import { detectCycles } from '../../utils/workflow/detectCycles';

export const createFormWorkflowSlice: StateCreator<
  FormBuilderState,
  [],
  [],
  FormWorkflowSlice
> = (set, get) => ({
  // Core data
  connections: [],
  nodePositions: {},
  
  // Connection validation
  cyclicConnections: {},
  
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
  setConnections: (connections: Connection[]) => {
    set({ connections })
    // Detect cycles after setting connections
    get().detectWorkflowCycles()
  },
  
  addConnection: (connection: Connection) => {
    // Ensure connection has required fields
    const validConnection = {
      ...connection,
      rules: connection.rules || [] // Ensure rules array exists
    };
    
    set((state) => ({
      connections: [...state.connections, validConnection]
    }))
    
    // Detect cycles after adding a connection
    get().detectWorkflowCycles()
    
    return validConnection.id;
  },
  
  updateConnection: (connectionId: string, updates: Partial<Connection>) => {
    const finalUpdates = { ...updates };
    // If rules are being updated and they are not empty, ensure the connection is marked as explicit.
    if (updates.rules && updates.rules.length > 0) {
      finalUpdates.is_explicit = true;
    }

    set((state) => ({
      connections: state.connections.map(conn => 
        conn.id === connectionId ? { ...conn, ...finalUpdates } : conn
      )
    }));
    get().validateConnections();
    
    // Detect cycles after updating connection
    get().detectWorkflowCycles();
  },
  
  removeConnection: (connectionId: string) => {
    set((state) => ({
      connections: state.connections.filter(conn => conn.id !== connectionId)
    }));
    
    // Detect cycles after removing connection
    get().detectWorkflowCycles();
  },
  
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
      conn.id === connectionId ? { ...conn, defaultTargetId: newTargetId, is_explicit: true } : conn
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
      console.log('Warning: Updating connection target would create an orphaned node');
      
      // Get the setOrphanedNodeDetails and setShowOrphanedNodeAlert functions from the store
      const setOrphanedNodeDetails = get().setOrphanedNodeDetails;
      const setShowOrphanedNodeAlert = get().setShowOrphanedNodeAlert;
      
      // Set the orphaned node details
      setOrphanedNodeDetails({
        connectionId,
        oldTargetId: oldTargetId || '', // Ensure oldTargetId is not null
        newTargetId
      });
      
      // Show the orphaned node alert
      setShowOrphanedNodeAlert(true);
      
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
      const sortedBlocks = [...blocks].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
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
              order_index: connections.length,
              is_explicit: false // Auto-generated connection for new block
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
    const { blocks, connections: currentConnections } = get(); // Get current blocks and connections
    
    // Ensure blocks are sorted by order_index before passing to the utility, 
    // as createDefaultConnections expects this for its logic.
    // The utility itself also sorts, but doing it here ensures consistency if that changes.
    const sortedBlocks = [...blocks].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    // Call the utility function to get the new state of all connections.
    // We pass all current blocks and their connections. 
    // Not passing targetBlockId signals it to handle reordering for the entire set.
    const updatedConnections = createDefaultConnections({
      blocks: sortedBlocks, // Pass all blocks currently in the store
      connections: currentConnections, // Pass all current connections
      // targetBlockId is omitted to trigger bulk processing logic suitable for reordering
    });

    // Update the store with the new, complete set of connections
    set({ connections: updatedConnections });
    
    console.log(`[onBlocksReordered] Connections updated. New count: ${updatedConnections.length}`);
    get().validateConnections(); // Validate after potential changes
  },

  // Utility method to validate all connections
  validateConnections: () => {
    const { connections } = get();
    const { blocks } = get() as unknown as FormBuilderState;

    // Build a new connections array immutably
    const validConnections = connections
      .filter(conn =>
        blocks.some(b => b.id === conn.sourceId) &&
        blocks.some(b => b.id === conn.defaultTargetId)
      )
      .map(conn => ({
        ...conn,
        rules: conn.rules
          ? conn.rules.filter(rule =>
              rule.target_block_id === '' ||
              blocks.some(b => b.id === rule.target_block_id)
            )
          : conn.rules
      }));

    // Only update if connections changed
    if (validConnections.length !== connections.length) {
      console.log(`Removed ${connections.length - validConnections.length} invalid connections`);
      set({ connections: validConnections });
    }

    return validConnections.length === connections.length;
  },
  
  // Utility method to detect workflow cycles
  detectWorkflowCycles: () => {
    const { connections } = get();
    const { blocks } = get() as unknown as FormBuilderState;
    
    if (!connections.length || !blocks.length) {
      // No cycles possible with empty connections or blocks
      set({ cyclicConnections: {} });
      return;
    }
    
    try {
      const { cycleConnections, hasCycles } = detectCycles(blocks, connections);
      
      if (hasCycles) {
        console.log('🚨 [Workflow] Cycle detection found infinite loops in workflow!')
      } else {
        console.log('✅ [Workflow] No cycles detected in current workflow.')
      }
      
      // Update cycle connections in state
      set({ cyclicConnections: cycleConnections });
      
      // Update the edge data to reflect cycles
      const { edges } = get();
      const updatedEdges = edges.map(edge => {
        const edgeData = edge.data || {};
        const connId = edgeData.connection?.id;
        
        if (connId && cycleConnections[connId]) {
          return {
            ...edge,
            data: {
              ...edgeData,
              inCycle: true
            }
          };
        } else {
          return {
            ...edge,
            data: {
              ...edgeData,
              inCycle: false
            }
          };
        }
      });
      
      if (JSON.stringify(edges) !== JSON.stringify(updatedEdges)) {
        set({ edges: updatedEdges });
      }
    } catch (error) {
      console.error('Error detecting workflow cycles:', error);
    }
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
