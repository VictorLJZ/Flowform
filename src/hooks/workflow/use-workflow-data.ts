import { useCallback, useEffect, useRef } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import { FormBlock } from '@/types/block-types';
import { Connection, WorkflowNodeData, WorkflowEdgeData, NodePosition, WorkflowSettings } from '@/types/workflow-types';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

interface UseWorkflowDataProps {
  blocks: FormBlock[];
  connections: Connection[];
  selectedElementId: string | null;
  targetNodeId: string | null;
}

/**
 * Custom hook to convert form blocks and connections to ReactFlow nodes and edges
 */
export function useWorkflowData({
  blocks,
  connections,
  selectedElementId,
  targetNodeId
}: UseWorkflowDataProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdgeData>([]);
  const initialNodesMapped = useRef(false);

  // Convert blocks to nodes only once
  useEffect(() => {
    if (blocks.length > 0 && !initialNodesMapped.current) {
      initialNodesMapped.current = true;
      
      // Get saved node positions from form settings if available
      const formData = useFormBuilderStore.getState().formData;
      const workflowSettings = formData.settings?.workflow as WorkflowSettings | undefined;
      const savedPositions = workflowSettings?.nodePositions;
      
      // Sort blocks by order to ensure proper sequence
      const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
      
      // Create a grid layout with a reasonable number of columns
      const gridColumns = Math.min(4, Math.ceil(Math.sqrt(sortedBlocks.length)));
      const horizontalGap = 300; // Consistent with auto-layout
      const verticalGap = 180;   // Consistent with auto-layout
      
      const newNodes = sortedBlocks.map((block, index) => {
        // Check if we have a saved position for this node
        if (savedPositions && savedPositions[block.id]) {
          // Use saved position if available
          return {
            id: block.id,
            type: 'formBlock',
            position: savedPositions[block.id],
            selected: selectedElementId === block.id,
            data: { 
              block, 
              label: block.title || 'Untitled Block',
              isConnectionTarget: targetNodeId === block.id
            }
          };
        }
        
        // If no saved position, calculate grid position (left-to-right, then top-to-bottom)
        const column = index % gridColumns;
        const row = Math.floor(index / gridColumns);
        
        // If we have connections, try to optimize for linear flow
        const hasLinearConnections = connections.some(conn => 
          conn.sourceId === block.id || conn.targetId === block.id
        );
        
        // For blocks with connections, prefer a simple left-to-right layout
        // For blocks without connections, use the grid layout
        const position = hasLinearConnections 
          ? { x: index * horizontalGap, y: 100 }  // Linear horizontal layout
          : { x: column * horizontalGap, y: row * verticalGap + 100 }; // Grid layout
        
        return {
          id: block.id,
          type: 'formBlock',
          position,
          selected: selectedElementId === block.id,
          data: { 
            block, 
            label: block.title || 'Untitled Block',
            isConnectionTarget: targetNodeId === block.id
          }
        };
      });
      
      setNodes(newNodes);
    }
  }, [blocks, setNodes, connections, selectedElementId, targetNodeId]);

  // Update node selection and connection target flags without repositioning
  useEffect(() => {
    setNodes(nodes => 
      nodes.map(node => ({
        ...node,
        selected: selectedElementId === node.id,
        data: {
          ...node.data,
          isConnectionTarget: targetNodeId === node.id,
        }
      }))
    );
  }, [selectedElementId, targetNodeId, setNodes]);

  // Convert connections to edges - optimize to prevent unnecessary re-renders
  useEffect(() => {
    if (connections.length > 0) {
      const newEdges = connections.map(connection => ({
        id: connection.id,
        source: connection.sourceId,
        target: connection.targetId,
        type: 'workflow',
        selected: selectedElementId === connection.id,
        data: { connection },
        zIndex: selectedElementId === connection.id ? 10 : 5, // Elevate selected edges
        style: { strokeWidth: selectedElementId === connection.id ? 3 : 2 } // Make selected edges thicker
      }));
      
      // Instead of complete replacement, update edges intelligently
      setEdges(prevEdges => {
        // If counts don't match, just replace all
        if (prevEdges.length !== newEdges.length) {
          return newEdges;
        }
        
        // Check if any essential properties changed
        const hasChanges = newEdges.some((edge, i) => {
          const prevEdge = prevEdges[i];
          return (
            edge.id !== prevEdge.id ||
            edge.source !== prevEdge.source ||
            edge.target !== prevEdge.target ||
            edge.selected !== prevEdge.selected ||
            // Deep compare the condition only
            JSON.stringify(edge.data?.connection?.condition) !== 
            JSON.stringify(prevEdge.data?.connection?.condition)
          );
        });
        
        // Return new array only if there are changes
        return hasChanges ? newEdges : prevEdges;
      });
    } else {
      // If no connections, clear the edges
      setEdges([]);
    }
  }, [connections, setEdges, selectedElementId]);

  // Apply a new layout to the nodes
  const applyNodePositions = useCallback((positions: { [id: string]: { x: number; y: number } }) => {
    setNodes(nodes => 
      nodes.map(node => ({
        ...node,
        position: positions[node.id] || node.position
      }))
    );
  }, [setNodes]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    applyNodePositions
  };
} 