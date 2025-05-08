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
      console.log(`🔎🔎 [WorkflowData] Connections data sample (showing default targets):`,
        connections.slice(0, 3).map(c => `${c.sourceId} -> ${c.defaultTargetId || 'N/A (no default)'} (Rules: ${c.rules?.length || 0})`));
      
      if (connections.length > 3) {
        console.log(`🔎… [WorkflowData] ...and ${connections.length - 3} more connections`);
      }
    }
    
    // Validate that both source and target blocks exist for each connection's default path
    const validConnections = connections.filter(connection => {
      const sourceExists = blocks.some(block => block.id === connection.sourceId);
      const defaultTargetBlockId = connection.defaultTargetId;
      // A connection is considered valid for default path rendering if its defaultTargetId is set and the target block exists.
      // Connections that only have rules (and no defaultTargetId) will be filtered out here for now,
      // as this part of the code currently only renders default paths.
      const targetExists = defaultTargetBlockId ? blocks.some(block => block.id === defaultTargetBlockId) : false;
      
      if (!sourceExists || !targetExists) {
        // Updated error message to be more specific about defaultTargetId
        console.error(`🚨🚨 [WorkflowData] Skipping invalid default connection ${connection.id}: ${connection.sourceId} -> ${defaultTargetBlockId || 'undefined (no defaultTargetId)'}. Source exists: ${sourceExists}, Target exists: ${targetExists}`);
        return false;
      }
      // Ensure defaultTargetId is present for the edge to be created in the next step.
      return !!defaultTargetBlockId;
    });
    
    if (validConnections.length !== connections.length) {
      const skippedCount = connections.length - validConnections.length;
      console.warn(`⚠️⚠️ [WorkflowData] Filtered out ${skippedCount} connections. This may include connections that only have rules and no default target, or connections with invalid default targets.`);
    }
    
    // Create edges from connections that have a valid defaultTargetId
    const newEdges = validConnections.map(connection => {
      // At this point, connection.defaultTargetId is guaranteed to be set due to the filter above.
      const edge = {
        id: connection.id, // For now, one connection object maps to one edge. This might change if rules are visualized.
        source: connection.sourceId,
        target: connection.defaultTargetId!, // Non-null assertion due to the filter
        type: 'workflow',
        selected: selectedElementId === connection.id,
        data: { connection },
        // Visual styling based on selection
        zIndex: selectedElementId === connection.id ? 10 : 5,
        style: { strokeWidth: selectedElementId === connection.id ? 3 : 2 }
      };
      
      console.log(`🔎✅ [WorkflowData] Created edge for default path ${connection.id}: ${connection.sourceId} -> ${connection.defaultTargetId}`);
      return edge;
    });
    
    console.log(`🔎📊 [WorkflowData] Setting ${newEdges.length} edges in ReactFlow`);
    setEdges(newEdges);
    
    // Look for nodes that have no incoming or outgoing connections (based on defaultTargetId for incoming)
    const orphanedNodes = blocks.filter(block => {
      const hasOutgoing = connections.some(conn => conn.sourceId === block.id && conn.defaultTargetId); // Consider outgoing only if it has a default target
      const hasIncoming = connections.some(conn => conn.defaultTargetId === block.id);
      // Also consider rules for outgoing/incoming if visualizing rule-based edges in the future
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