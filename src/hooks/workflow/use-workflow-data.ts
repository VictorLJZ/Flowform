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
        connections.slice(0, 3).map(c => `${c.sourceId} -> ${c.defaultTargetId || 'N/A'} (Rules: ${c.rules?.length || 0})`));
      
      if (connections.length > 3) {
        console.log(`🔎… [WorkflowData] ...and ${connections.length - 3} more connections`);
      }
    }
    
    // 1. Create a list to store all edges (default paths and rule-based paths)
    const allEdges = [];
    
    // 2. Process each connection
    for (const connection of connections) {
      const sourceId = connection.sourceId;
      const sourceExists = blocks.some(block => block.id === sourceId);
      
      if (!sourceExists) {
        console.error(`🔴 [WorkflowData] Skipping connection ${connection.id} with invalid source: ${sourceId}`);
        continue;
      }
      
      // 3. First, create an edge for the default path if it exists
      if (connection.defaultTargetId) {
        const targetExists = blocks.some(block => block.id === connection.defaultTargetId);
        
        if (targetExists) {
          // Create the default path edge
          const defaultEdge = {
            id: `${connection.id}-default`,
            source: sourceId,
            target: connection.defaultTargetId,
            type: 'workflow',
            selected: selectedElementId === connection.id,
            data: { 
              connection,
              isDefaultPath: true
            },
            // Visual styling for default path
            zIndex: selectedElementId === connection.id ? 10 : 5,
            style: { 
              strokeWidth: selectedElementId === connection.id ? 3 : 2,
              stroke: '#000000' // Default color
            }
          };
          
          allEdges.push(defaultEdge);
          console.log(`🔎✅ [WorkflowData] Created edge for default path: ${sourceId} -> ${connection.defaultTargetId}`);
        } else {
          console.error(`🔴 [WorkflowData] Skipping default path with invalid target: ${connection.defaultTargetId}`);
        }
      }
      
      // 4. Then, create edges for each rule target
      if (connection.rules && connection.rules.length > 0) {
        for (const rule of connection.rules) {
          const targetBlockId = rule.target_block_id;
          
          if (!targetBlockId) {
            console.warn(`⚠️ [WorkflowData] Rule ${rule.id} has no target block ID`);
            continue;
          }
          
          const targetExists = blocks.some(block => block.id === targetBlockId);
          
          if (targetExists) {
            // Skip if this rule's target is the same as the default path
            // (to avoid duplicate edges)
            if (targetBlockId === connection.defaultTargetId) {
              console.log(`🔎ℹ️ [WorkflowData] Rule ${rule.id} target matches default path, not creating duplicate edge`);
              continue;
            }
            
            // Generate a unique ID for the rule-based edge
            const ruleEdgeId = `${connection.id}-rule-${rule.id}`;
            
            // Determine if the rule has actual conditions
            const hasConditions = rule.condition_group && 
                                 rule.condition_group.conditions && 
                                 rule.condition_group.conditions.length > 0;
            
            // Get the condition operator (useful for styling)
            const firstCondition = hasConditions ? rule.condition_group.conditions[0] : null;
            const conditionOperator = firstCondition ? firstCondition.operator : null;
            
            // Create the rule-based edge
            const ruleEdge = {
              id: ruleEdgeId,
              source: sourceId,
              target: targetBlockId,
              type: 'workflow',
              selected: selectedElementId === ruleEdgeId,
              data: { 
                connection,
                isRulePath: true,
                rule,
                hasConditions,
                conditionOperator
              },
              // Visual styling for rule-based path - black like all paths
              zIndex: selectedElementId === ruleEdgeId ? 10 : 4,
              style: { 
                strokeWidth: 1, // Consistent width for all paths
                stroke: '#000000', // Black color for all paths
                strokeDasharray: '0', // Always solid line
              }
            };
            
            allEdges.push(ruleEdge);
            console.log(`🔎✅ [WorkflowData] Created edge for rule path: ${sourceId} -> ${targetBlockId} (rule ${rule.id})`);
          } else {
            console.error(`🔴 [WorkflowData] Skipping rule path with invalid target: ${targetBlockId}`);
          }
        }
      }
    }
    
    console.log(`🔎📊 [WorkflowData] Setting ${allEdges.length} edges in ReactFlow`);
    setEdges(allEdges);
    
    // 5. Check for orphaned nodes (now accounting for rule-based connections too)
    const orphanedNodes = blocks.filter(block => {
      // Check default outgoing connections
      const hasDefaultOutgoing = connections.some(conn => conn.sourceId === block.id && conn.defaultTargetId);
      
      // Check rule-based outgoing connections
      const hasRuleOutgoing = connections.some(conn => 
        conn.sourceId === block.id && 
        conn.rules && 
        conn.rules.some(rule => rule.target_block_id)
      );
      
      // Check default incoming connections
      const hasDefaultIncoming = connections.some(conn => conn.defaultTargetId === block.id);
      
      // Check rule-based incoming connections
      const hasRuleIncoming = connections.some(conn => 
        conn.rules && 
        conn.rules.some(rule => rule.target_block_id === block.id)
      );
      
      return !hasDefaultOutgoing && !hasRuleOutgoing && !hasDefaultIncoming && !hasRuleIncoming;
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