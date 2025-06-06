/**
 * FlowForm Workflow Handlers
 * Clean implementation of React Flow event handlers
 * Using Zustand store as the single source of truth
 */

import { 
  NodeMouseHandler, 
  EdgeMouseHandler,
  Node,
  Edge,
  Connection as ReactFlowConnection,
  NodeDragHandler,
  XYPosition,
  OnConnect,
  OnConnectStartParams
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useCallback } from 'react';
import { Connection, WorkflowNodeData, WorkflowEdgeData } from '@/types/workflow-types';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

/**
 * Utility function to auto-layout a workflow based on connections
 * This is a simplified version that arranges nodes in a horizontal flow
 */
export function calculateAutoLayout(nodes: Node<WorkflowNodeData>[], connectionMap: Record<string, string[]>): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const horizontalSpacing = 300;
  const verticalSpacing = 100;
  
  // Find root nodes (nodes with no incoming connections)
  const hasIncoming = new Set<string>();
  // Add all target nodes to the hasIncoming set
  Object.values(connectionMap).forEach(targets => {
    targets.forEach(target => hasIncoming.add(target));
  });
  
  const rootNodeIds = nodes
    .map(node => node.id)
    .filter(id => !hasIncoming.has(id));
  
  // If no root nodes found, use the first node
  if (rootNodeIds.length === 0 && nodes.length > 0) {
    rootNodeIds.push(nodes[0].id);
  }
  
  // Process nodes level by level (breadth-first)
  const processedNodes = new Set<string>();
  const queue: { id: string; x: number; y: number }[] = rootNodeIds.map((id, index) => ({
    id,
    x: 100,
    y: index * (verticalSpacing * 1.5) + 100
  }));
  
  while (queue.length > 0) {
    const { id, x, y } = queue.shift()!;
    
    if (processedNodes.has(id)) continue;
    
    positions[id] = { x, y };
    processedNodes.add(id);
    
    // Process children
    const targets = connectionMap[id] || [];
    targets.forEach((targetId, index) => {
      if (!processedNodes.has(targetId)) {
        queue.push({
          id: targetId,
          x: x + horizontalSpacing,
          y: y + (index - (targets.length - 1) / 2) * verticalSpacing
        });
      }
    });
  }
  
  return positions;
}

/**
 * Hook to handle automatic layout of workflow nodes
 */
export function useAutoLayout() {
  const blocks = useFormBuilderStore(state => state.blocks);
  const connections = useFormBuilderStore(state => state.connections);
  const updateNodePositions = useFormBuilderStore(state => state.updateNodePositions);
  
  return useCallback(() => {
    // Create a map of source node IDs to their target node IDs
    const connectionMap: Record<string, string[]> = {};
    
    connections.forEach(conn => {
      if (!connectionMap[conn.sourceId]) {
        connectionMap[conn.sourceId] = [];
      }
      const targets = new Set<string>();
      // Add target_block_id from each rule
      conn.rules.forEach(rule => {
        if (rule.target_block_id) {
          targets.add(rule.target_block_id);
        }
      });
      // Add defaultTargetId if it exists
      if (conn.defaultTargetId) {
        targets.add(conn.defaultTargetId);
      }
      connectionMap[conn.sourceId].push(...Array.from(targets));
    });
    
    // Convert blocks to nodes for the layout algorithm
    const nodes = blocks.map(block => ({
      id: block.id,
      data: { block },
      position: { x: 0, y: 0 }
    })) as Node<WorkflowNodeData>[];
    
    // Calculate the layout
    const positions = calculateAutoLayout(nodes, connectionMap);
    
    // Update positions in the store
    updateNodePositions(positions);
    
    return positions;
  }, [blocks, connections, updateNodePositions]);
}

/**
 * Node click handler - select a node when clicked
 */
export const useNodeClickHandler = (): NodeMouseHandler => {
  const selectElement = useFormBuilderStore(state => state.selectElement);
  
  return useCallback((event: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    selectElement(node.id);
  }, [selectElement]);
};

/**
 * Edge click handler - select an edge when clicked
 */
export const useEdgeClickHandler = (): EdgeMouseHandler => {
  const selectElement = useFormBuilderStore(state => state.selectElement);
  
  return useCallback((event: React.MouseEvent, edge: Edge<WorkflowEdgeData>) => {
    selectElement(edge.id);
  }, [selectElement]);
};

/**
 * Edge double-click handler - no longer supports deletion
 * Connection deletion has been disabled to prevent orphaned nodes
 */
export const useEdgeDoubleClickHandler = (): EdgeMouseHandler => {
  const selectElement = useFormBuilderStore(state => state.selectElement);
  
  return useCallback((event: React.MouseEvent, edge: Edge<WorkflowEdgeData>) => {
    // Simply select the edge - no deletion functionality
    selectElement(edge.id);
    
    // Connections cannot be deleted to prevent orphaned nodes
    // No alert is shown, deletion is simply disabled
  }, [selectElement]);
};

/**
 * Connection handler - handle new connections between nodes
 */
export const useConnectionHandler = (): OnConnect => {
  const addConnection = useFormBuilderStore(state => state.addConnection);
  const selectElement = useFormBuilderStore(state => state.selectElement);
  const setIsConnecting = useFormBuilderStore(state => state.setIsConnecting);
  const setSourceNodeId = useFormBuilderStore(state => state.setSourceNodeId);
  const setTargetNodeId = useFormBuilderStore(state => state.setTargetNodeId);
  
  return useCallback(
    (params: ReactFlowConnection) => {
      if (!params.source || !params.target) {
        console.warn('Connection attempt with missing source or target:', params);
        return; // Invalid connection parameters
      }

      setIsConnecting(false);
      setSourceNodeId(null);
      setTargetNodeId(null);

      // Create a new Connection object based on the new structure for an "always" connection
      const newConnection: Connection = {
        id: uuidv4(),
        sourceId: params.source,
        defaultTargetId: params.target, // For an "always" connection, this is the main target
        rules: [], // No specific rules for an "always" connection
        is_explicit: true, // Explicitly set this as a user-created connection
      };

      addConnection(newConnection);
      selectElement(newConnection.id); // Select the new connection
    },
    [addConnection, selectElement, setIsConnecting, setSourceNodeId, setTargetNodeId]
  );
};

/**
 * Handlers for connection start/end
 */
export const useConnectionStartEndHandlers = () => {
  const setIsConnecting = useFormBuilderStore(state => state.setIsConnecting);
  const setSourceNodeId = useFormBuilderStore(state => state.setSourceNodeId);
  const setTargetNodeId = useFormBuilderStore(state => state.setTargetNodeId);
  
  const onConnectStart = useCallback((event: React.MouseEvent | React.TouchEvent, params: OnConnectStartParams) => {
    // Only allow connections from handles, specifically the source handle (grey dot)
    if (params.nodeId && params.handleId && params.handleType === 'source') {
      setIsConnecting(true);
      setSourceNodeId(params.nodeId);
      
      // For debugging
      console.log('Starting connection from source handle:', params.nodeId);
    } else {
      // If connection attempt doesn't start from source handle, block it
      event.preventDefault();
      setIsConnecting(false);
    }
  }, [setIsConnecting, setSourceNodeId]);

  const onConnectEnd = useCallback(() => {
    // Always clean up connecting state
    setIsConnecting(false);
    setSourceNodeId(null);
    setTargetNodeId(null);
  }, [setIsConnecting, setSourceNodeId, setTargetNodeId]);

  return { onConnectStart, onConnectEnd };
};

/**
 * Handle node position changes
 */
export const useNodeDragHandler = (): NodeDragHandler => {
  const updateNodePositions = useFormBuilderStore(state => state.updateNodePositions);
  
  return useCallback((event: React.MouseEvent | React.TouchEvent, node: Node, nodes: Node[]) => {
    // Only update positions when drag ends (user releases mouse)
    if (!event.type.includes('end')) return;
    
    // Find the nodes that have absolute positions
    const nodesWithPositions = nodes.filter(n => n.positionAbsolute);
    
    if (nodesWithPositions.length > 0) {
      // Create a positions object to update the store
      const positions: Record<string, XYPosition> = {};
      
      nodesWithPositions.forEach(n => {
        if (n.positionAbsolute) {
          positions[n.id] = {
            x: n.positionAbsolute.x,
            y: n.positionAbsolute.y
          };
        }
      });
      
      // Update the store with the new positions
      updateNodePositions(positions);
    }
  }, [updateNodePositions]);
};

/**
 * Helper function to handle node target highlighting
 * when connecting nodes
 */
export const useNodeHighlightHandler = () => {
  const isConnecting = useFormBuilderStore(state => state.isConnecting);
  const sourceNodeId = useFormBuilderStore(state => state.sourceNodeId);
  
  return useCallback((nodes: Node<WorkflowNodeData>[]) => {
    if (!isConnecting || !sourceNodeId) return nodes;
    
    // Add a visual indicator for potential target nodes
    return nodes.map(node => {
      // Don't highlight the source node itself as a target
      if (node.id === sourceNodeId) return node;
      
      // Mark other nodes as potential targets
      return {
        ...node,
        data: {
          ...node.data,
          isConnectionTarget: true
        }
      };
    });
  }, [isConnecting, sourceNodeId]);
};
