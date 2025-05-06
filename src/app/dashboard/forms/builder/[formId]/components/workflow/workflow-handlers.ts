import { 
  NodeMouseHandler, 
  EdgeMouseHandler,
  Node,
  Edge,
  Connection as ReactFlowConnection,
  NodeChange,
  useStoreApi
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { Connection } from '@/types/workflow-types';
import { WorkflowNodeData, WorkflowEdgeData } from '@/types/workflow-types';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

interface NodeWithPosition {
  id: string;
  positionAbsolute?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
}

/**
 * Get node click handler
 */
export const useNodeClickHandler = (
  setSelectedElement: Dispatch<SetStateAction<Node<WorkflowNodeData> | Edge<WorkflowEdgeData> | null>>
): NodeMouseHandler => {
  return useCallback((_, node) => {
    setSelectedElement(node as Node<WorkflowNodeData>);
  }, [setSelectedElement]);
};

/**
 * Get edge click handler
 */
export const useEdgeClickHandler = (
  setSelectedElement: Dispatch<SetStateAction<Node<WorkflowNodeData> | Edge<WorkflowEdgeData> | null>>
): EdgeMouseHandler => {
  return useCallback((_, edge) => {
    setSelectedElement(edge as Edge<WorkflowEdgeData>);
  }, [setSelectedElement]);
};

/**
 * Get edge double-click handler for deletion
 */
export const useEdgeDoubleClickHandler = (
  removeConnection: (id: string) => void,
  selectedElement: Node<WorkflowNodeData> | Edge<WorkflowEdgeData> | null,
  setSelectedElement: Dispatch<SetStateAction<Node<WorkflowNodeData> | Edge<WorkflowEdgeData> | null>>
): EdgeMouseHandler => {
  return useCallback((event, edge) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (edge.id) {
      console.log(`Double-click deleting connection with id: ${edge.id}`);
      
      // If this edge was selected, clear the selection first
      if (selectedElement?.id === edge.id) {
        setSelectedElement(null);
      }
      
      try {
        // Remove the connection
        removeConnection(edge.id);
      } catch (error) {
        console.error('Failed to remove connection:', error);
      }
    }
  }, [removeConnection, selectedElement, setSelectedElement]);
};

/**
 * Get the handler for when connections are created
 */
export const useConnectionHandler = (
  addConnection: (connection: Connection) => void,
  connections: Connection[],
  setEdges: Dispatch<SetStateAction<Edge<WorkflowEdgeData>[]>>,
  setSelectedElement: Dispatch<SetStateAction<Node<WorkflowNodeData> | Edge<WorkflowEdgeData> | null>>,
  setTargetNode: Dispatch<SetStateAction<string | null>>,
  setSourceNodeId: Dispatch<SetStateAction<string | null>>,
  setIsConnecting: Dispatch<SetStateAction<boolean>>
) => {
  return useCallback(
    (connection: ReactFlowConnection) => {
      if (!connection.source || !connection.target) {
        console.error('Cannot create connection without source and target');
        return;
      }
      
      // Check for duplicate connections - prevent creating duplicates
      const isDuplicate = connections.some(
        conn => conn.sourceId === connection.source && conn.targetId === connection.target
      );
      
      if (isDuplicate) {
        console.log('Skipping duplicate connection creation');
        
        // Reset connection state
        setTargetNode(null);
        setSourceNodeId(null);
        setIsConnecting(false);
        
        return;
      }
      
      // Create connection with unique ID
      const newConnectionId = uuidv4();
      console.log(`Creating new connection with id: ${newConnectionId}`);
      
      const newConnection: Connection = {
        id: newConnectionId,
        sourceId: connection.source,
        targetId: connection.target,
        order: connections.length
      };
      
      try {
        // First update the UI with new edge
        const newEdge = {
          id: newConnectionId,
          source: connection.source,
          target: connection.target,
          type: 'workflow',
          data: { connection: newConnection }
        } as Edge<WorkflowEdgeData>;
        
        // Update the edges display first
        setEdges(edges => [...edges, newEdge]);
        
        // Then update the store
        addConnection(newConnection);
        
        // Auto-open the sidebar to edit the new connection
        setSelectedElement(newEdge);
      } catch (error) {
        console.error('Failed to create connection:', error);
      }
      
      // Reset connection state
      setTargetNode(null);
      setSourceNodeId(null);
      setIsConnecting(false);
    },
    [addConnection, connections, setEdges, setSelectedElement, setTargetNode, setSourceNodeId, setIsConnecting]
  );
};

/**
 * Get handlers for connection start/end
 */
export const useConnectionStartEndHandlers = (
  setIsConnecting: Dispatch<SetStateAction<boolean>>,
  setSourceNodeId: Dispatch<SetStateAction<string | null>>,
  setTargetNode: Dispatch<SetStateAction<string | null>>
) => {
  const onConnectStart = useCallback((
    _event: React.MouseEvent | React.TouchEvent,
    params: { nodeId: string | null; handleId: string | null }
  ) => {
    if (!params.nodeId) return;
    
    // Set connecting state
    setIsConnecting(true);
    setSourceNodeId(params.nodeId);
  }, [setIsConnecting, setSourceNodeId]);
  
  const onConnectEnd = useCallback(() => {
    // Reset all connection state
    setIsConnecting(false);
    setSourceNodeId(null);
    setTargetNode(null);
    
    // Clean up any connection styling that might remain
    setTimeout(() => {
      // Remove connection-target class from all nodes
      document.querySelectorAll('.connection-target').forEach(el => {
        el.classList.remove('connection-target');
      });
      
      // Remove connecting attribute from any source nodes
      document.querySelectorAll('[data-connecting="true"]').forEach(el => {
        el.removeAttribute('data-connecting');
      });
    }, 50);
  }, [setIsConnecting, setSourceNodeId, setTargetNode]);
  
  return { onConnectStart, onConnectEnd };
};

/**
 * Handle node changes with connection target highlighting
 * Optimized version to prevent infinite loops
 */
export const useNodeChangeHandler = (
  onNodesChange: (changes: NodeChange[]) => void,
  isConnecting: boolean,
  store: ReturnType<typeof useStoreApi>,
  sourceNodeId: string | null,
  targetNode: string | null,
  setTargetNode: Dispatch<SetStateAction<string | null>>,
  setNodes: Dispatch<SetStateAction<Node<WorkflowNodeData>[]>>
) => {
  return useCallback((changes: NodeChange[]) => {
    // Apply the native onNodesChange first
    onNodesChange(changes);
    
    // Only run highlight logic during connection process
    if (!isConnecting) {
      // If we're not connecting but there's a targetNode set, clear it
      if (targetNode) {
        setTargetNode(null);
        
        // Reset highlighting on nodes - do this in a separate DOM update
        // to avoid React state updates in the middle of a render cycle
        setTimeout(() => {
          document.querySelectorAll('.connection-target').forEach(el => {
            el.classList.remove('connection-target');
          });
        }, 0);
      }
      return;
    }
    
    // Handle connection targeting logic
    try {
      const state = store.getState();
      const mousePosition = (state as Record<string, unknown>).mousePos as [number, number];
      
      if (!mousePosition) return;
      
      // Get node internals from store
      const nodeInternals = state.nodeInternals as Map<string, NodeWithPosition>;
      
      if (!nodeInternals || nodeInternals.size === 0) return;
      
      // Find node under cursor
      let nodeUnderMouse: NodeWithPosition | undefined;
      
      // Using traditional for loop to avoid creating unnecessary arrays
      for (const node of nodeInternals.values()) {
        if (!node.positionAbsolute || node.id === sourceNodeId) continue;
        
        const { x, y } = node.positionAbsolute;
        const width = node.positionAbsolute.width || 240;
        const height = node.positionAbsolute.height || 80;
        
        if (
          mousePosition[0] >= x &&
          mousePosition[0] <= x + width &&
          mousePosition[1] >= y &&
          mousePosition[1] <= y + height
        ) {
          nodeUnderMouse = node;
          break;
        }
      }
      
      // Get new target node ID
      const newTargetNodeId = nodeUnderMouse?.id || null;
      
      // Only update if the target node has changed
      if (newTargetNodeId !== targetNode) {
        setTargetNode(newTargetNodeId);
        
        // Use DOM manipulations for highlighting instead of React state updates
        // This avoids unnecessary re-renders and potential infinite loops
        if (targetNode) {
          // Remove highlight from previous target
          const prevEl = document.querySelector(`[data-id="${targetNode}"]`);
          if (prevEl) {
            prevEl.classList.remove('connection-target');
          }
        }
        
        if (newTargetNodeId) {
          // Add highlight to new target
          const newEl = document.querySelector(`[data-id="${newTargetNodeId}"]`);
          if (newEl) {
            newEl.classList.add('connection-target');
          }
        }
      }
    } catch (error) {
      console.error('Error in node change handler:', error);
    }
  }, [onNodesChange, isConnecting, store, sourceNodeId, targetNode, setTargetNode]);
}; 