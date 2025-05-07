import { useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState, Node } from 'reactflow';
// Only importing what's actually used in this file
import { WorkflowNodeData } from '@/types/workflow-types';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

/**
 * Custom hook to convert form blocks and connections to ReactFlow nodes and edges
 * This hook focuses solely on data transformation between app state and ReactFlow
 */
export function useWorkflowData() {
  // Get data directly from the store instead of props
  const blocks = useFormBuilderStore(state => state.blocks);
  const connections = useFormBuilderStore(state => state.connections);
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId);
  const nodePositions = useFormBuilderStore(state => state.nodePositions);
  const updateNodePosition = useFormBuilderStore(state => state.updateNodePosition);
  
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert blocks to nodes whenever blocks or node positions change
  useEffect(() => {
    if (blocks.length > 0) {
      // Sort blocks by order to ensure proper sequence
      const sortedBlocks = [...blocks].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      
      // Default layout values
      const gridColumns = Math.min(4, Math.ceil(Math.sqrt(sortedBlocks.length)));
      const horizontalGap = 300;
      const verticalGap = 180;
      
      const newNodes = sortedBlocks.map((block, index) => {
        // Use stored position from nodePositions or calculate a default position
        const position = nodePositions[block.id] || {
          x: (index % gridColumns) * horizontalGap,
          y: Math.floor(index / gridColumns) * verticalGap + 100
        };
        
        return {
          id: block.id,
          type: 'formBlock',
          position,
          selected: selectedElementId === block.id,
          data: { 
            block, 
            label: block.title || 'Untitled Block'
          }
        };
      });
      
      setNodes(newNodes);
    } else {
      setNodes([]);
    }
  }, [blocks, nodePositions, selectedElementId, setNodes]);

  // Update node selection status when selectedElementId changes 
  useEffect(() => {
    setNodes(nodes => 
      nodes.map(node => ({
        ...node,
        selected: selectedElementId === node.id
      }))
    );
  }, [selectedElementId, setNodes]);

  // Convert connections to edges
  useEffect(() => {
    console.log(`🔎🔎 [WorkflowData] Converting ${connections.length} connections to ReactFlow edges`);
    
    if (connections.length > 0) {
      console.log(`🔎🔎 [WorkflowData] Connections data sample:`, 
        connections.slice(0, 3).map(c => `${c.sourceId} -> ${c.targetId} (${c.conditionType})`));
      
      if (connections.length > 3) {
        console.log(`🔎… [WorkflowData] ...and ${connections.length - 3} more connections`);
      }
    }
    
    // Validate that both source and target blocks exist for each connection
    const validConnections = connections.filter(connection => {
      const sourceExists = blocks.some(block => block.id === connection.sourceId);
      const targetExists = blocks.some(block => block.id === connection.targetId);
      
      if (!sourceExists || !targetExists) {
        console.error(`🚨🚨 [WorkflowData] Skipping invalid connection ${connection.id}: ${connection.sourceId} -> ${connection.targetId}. Source exists: ${sourceExists}, Target exists: ${targetExists}`);
        return false;
      }
      return true;
    });
    
    if (validConnections.length !== connections.length) {
      console.warn(`⚠️⚠️ [WorkflowData] Filtered out ${connections.length - validConnections.length} invalid connections`);
    }
    
    // Create edges from connections
    const newEdges = validConnections.map(connection => {
      const edge = {
        id: connection.id,
        source: connection.sourceId,
        target: connection.targetId,
        type: 'workflow',
        selected: selectedElementId === connection.id,
        data: { connection },
        // Visual styling based on selection
        zIndex: selectedElementId === connection.id ? 10 : 5,
        style: { strokeWidth: selectedElementId === connection.id ? 3 : 2 }
      };
      
      console.log(`🔎✅ [WorkflowData] Created edge ${connection.id}: ${connection.sourceId} -> ${connection.targetId}`);
      return edge;
    });
    
    console.log(`🔎📊 [WorkflowData] Setting ${newEdges.length} edges in ReactFlow`);
    setEdges(newEdges);
    
    // Look for nodes that have no incoming or outgoing connections
    const orphanedNodes = blocks.filter(block => {
      const hasOutgoing = connections.some(conn => conn.sourceId === block.id);
      const hasIncoming = connections.some(conn => conn.targetId === block.id);
      return !hasOutgoing && !hasIncoming;
    });
    
    if (orphanedNodes.length > 0) {
      console.warn(`🔎⚠️ [WorkflowData] Found ${orphanedNodes.length} orphaned blocks with no connections:`, 
        orphanedNodes.map(n => `${n.title || 'Untitled'} (${n.id})`));
    }
  }, [blocks, connections, selectedElementId, setEdges]);

  // Handle node position updates (when dragging nodes)
  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    // Save the new position to the store
    if (node.positionAbsolute) {
      updateNodePosition(node.id, {
        x: node.positionAbsolute.x,
        y: node.positionAbsolute.y
      });
    }
  }, [updateNodePosition]);
  
  // Apply positions from the store when they change
  const applyNodePositions = useCallback(() => {
    setNodes(nodes => 
      nodes.map(node => ({
        ...node,
        position: nodePositions[node.id] || node.position
      }))
    );
  }, [setNodes, nodePositions]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    handleNodeDragStop,
    applyNodePositions
  };
} 