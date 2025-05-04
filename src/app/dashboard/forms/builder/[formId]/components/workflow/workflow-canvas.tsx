// src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-canvas.tsx
"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background, 
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection as ReactFlowConnection,
  Node,
  Edge,
  NodeMouseHandler,
  EdgeMouseHandler,
  Panel,
  useReactFlow,
  ConnectionLineType,
  useStoreApi,
  NodeChange,
  ConnectionMode
} from 'reactflow'
import { v4 as uuidv4 } from 'uuid'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import WorkflowNode from './workflow-node'
import WorkflowEdge from './workflow-edge'
import WorkflowSidebar from './workflow-sidebar'
import WorkflowControls from './workflow-controls'
import { type Connection } from '@/types/workflow-types'
import { WorkflowNodeData, WorkflowEdgeData } from '@/types/workflow-types'
import { ArrowUpRight } from 'lucide-react'

// Custom connection line component to have a pulsing dotted line with arrowhead
const CustomConnectionLine = ({ fromX, fromY, toX, toY }: { fromX: number, fromY: number, toX: number, toY: number }) => {
  // Calculate the control points for a bezier curve
  // Use much closer control points for nearly straight lines
  const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const controlDistance = Math.min(60, distance * 0.2); // Even lower control distance for nearly straight lines
  
  const controlPointX1 = fromX + controlDistance;
  const controlPointY1 = fromY;
  const controlPointX2 = toX - controlDistance;
  const controlPointY2 = toY;
  
  // Calculate the direction for the arrowhead
  const dx = toX - controlPointX2;
  const dy = toY - controlPointY2;
  const angle = Math.atan2(dy, dx);
  
  // Arrow dimensions
  const arrowLength = 10;
  const arrowWidth = 6;
  
  // Calculate arrowhead points
  const arrowPoint1X = toX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle);
  const arrowPoint1Y = toY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle);
  const arrowPoint2X = toX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle);
  const arrowPoint2Y = toY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle);
  
  // Use pure black for connection lines
  const connectorColor = '#000000';
  
  return (
    <g>
      {/* Draw the bezier path */}
      <path
        d={`M ${fromX} ${fromY} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${toX} ${toY}`}
        fill="none"
        className="animated-connection-path"
        style={{
          stroke: connectorColor,
          strokeWidth: 2,
          strokeDasharray: '5, 5',
          animation: 'flowDash 1s linear infinite',
        }}
      />
      
      {/* Draw the arrowhead */}
      <polygon 
        points={`${toX},${toY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`} 
        fill={connectorColor}
      />
    </g>
  );
};

const nodeTypes = { formBlock: WorkflowNode }
const edgeTypes = { workflow: WorkflowEdge }

// CSS animation styles for the flow
const flowAnimationStyles = `
  @keyframes flowDash {
    to {
      stroke-dashoffset: -20;
    }
  }
  
  .react-flow__connection-path {
    stroke: #000000; /* Pure black for all connection paths */
    stroke-width: 2;
  }

  /* Improved handle styles - larger click area with hidden background */
  .react-flow__handle {
    opacity: 0; /* Make the actual handle transparent */
    cursor: pointer;
    transition: all 0.2s;
    width: 28px !important;
    height: 28px !important;
    border: none !important;
    background: transparent !important;
    position: absolute;
  }
  
  /* Remove hover rules since we're handling that in the component */
  .react-flow__handle:hover {
    width: 28px !important;
    height: 28px !important;
    background: transparent !important;
  }
  
  /* Custom handle hit area */
  .handle-hit-area {
    width: 24px;
    height: 24px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }
  
  .handle-hit-area-left {
    left: -12px;
  }
  
  .handle-hit-area-right {
    right: -12px;
  }
  
  /* When connecting, improve visibility */
  .react-flow__handle.connecting {
    opacity: 1 !important;
  }
  
  /* When handle is valid, improve visibility */
  .react-flow__handle.valid {
    opacity: 1 !important;
  }

  /* For selection state */
  .react-flow__node.selected .react-flow__handle {
    background-color: #f59e0b !important; /* Amber color for selected state */
  }

  /* Ensure handles are perfectly centered */
  .react-flow__handle-top {
    top: -5px !important;
    left: 50% !important;
    transform: translate(-50%, 0);
  }
  
  .react-flow__handle-bottom {
    bottom: -5px !important;
    left: 50% !important;
    transform: translate(-50%, 0);
  }
  
  .react-flow__handle-left {
    left: -5px !important;
    top: 50% !important;
    transform: translate(0, -50%);
  }
  
  .react-flow__handle-right {
    right: -5px !important;
    top: 50% !important;
    transform: translate(0, -50%);
  }

  /* Edge delete animations */
  @keyframes deleteButtonPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
  }

  /* Apply animation to delete button on hover - but keep it subtle */
  .edge-delete-button:hover {
    animation: none; /* Remove the animation that's causing problems */
  }

  /* Feedback toast animation */
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* Edge removal animation */
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* Toast notification styles */
  .delete-toast {
    animation: slideInRight 0.3s ease-out forwards;
  }

  /* Add transition to edges for smooth deletion */
  .react-flow__edge {
    transition: opacity 0.2s ease-out;
  }
  .react-flow__edge.deleting {
    opacity: 0;
  }

  /* When connecting, highlight valid connection targets */
  .react-flow__node[data-connecting="true"] {
    filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));
  }

  /* Highlight nodes on connection drag approach */
  .connection-target {
    filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)) !important;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.6);
    transition: all 0.3s ease-in-out;
  }

  /* Improved connection line */
  .animated-connection-path {
    animation: flowDash 1s linear infinite !important;
    stroke-width: 2.5px !important;
    stroke-opacity: 0.8;
  }

  /* Improved connection paths */
  .react-flow__edge-path {
    stroke-width: 2px !important; 
  }
  
  /* Selected edges should be amber/gold */
  .react-flow__edge.selected .react-flow__edge-path {
    stroke: #f59e0b !important; /* amber-500 */
    stroke-width: 3px !important;
  }
  
  /* Make edge paths shorter to connect closer to nodes */
  .react-flow__edge {
    --edge-stroke-width: 2px;
    --edge-path-stroke: #000000;
  }
  
  /* Reduce the bezier curve strength */
  .react-flow__edge-bezier {
    --edge-curvature: 0.2;
  }
`;

// Node position with dimensions for hit testing
interface NodeWithPosition {
  id: string;
  positionAbsolute?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
}

export default function WorkflowCanvas() {
  const blocks = useFormBuilderStore(state => state.blocks)
  const connections = useFormBuilderStore(state => state.connections)
  const addConnection = useFormBuilderStore(state => state.addConnection)
  const removeConnection = useFormBuilderStore(state => state.removeConnection)
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedElement, setSelectedElement] = useState<Node<WorkflowNodeData> | Edge<WorkflowEdgeData> | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [targetNode, setTargetNode] = useState<string | null>(null)
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null)
  const reactFlowInstance = useReactFlow()
  const store = useStoreApi()
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const hasAppliedInitialLayout = useRef(false);
  const autoLayoutRef = useRef<() => void>(() => {});

  // Define applyAutoLayout function 
  const applyAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    
    // Create a more horizontal-oriented layout
    // Step 1: Find root nodes (no incoming edges)
    const incomingConnections = new Map<string, number>();
    
    // Count incoming connections for each node
    edges.forEach(edge => {
      const target = edge.target;
      incomingConnections.set(target, (incomingConnections.get(target) || 0) + 1);
    });
    
    // Find root nodes (nodes with no incoming connections)
    const rootNodes = nodes.filter(node => !incomingConnections.has(node.id));
    
    // If no root nodes, use the first node as root
    if (rootNodes.length === 0 && nodes.length > 0) {
      // Consider the first node a root node
      rootNodes.push(nodes[0]);
    }
    
    // Step 2: Build node relationships
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string[]>();
    
    // Initialize for all nodes
    nodes.forEach(node => {
      childrenMap.set(node.id, []);
      parentMap.set(node.id, []);
    });
    
    // Fill with edge relationships
    edges.forEach(edge => {
      const source = edge.source;
      const target = edge.target;
      
      // Add to children map
      const children = childrenMap.get(source) || [];
      if (!children.includes(target)) {
        children.push(target);
        childrenMap.set(source, children);
      }
      
      // Add to parent map
      const parents = parentMap.get(target) || [];
      if (!parents.includes(source)) {
        parents.push(source);
        parentMap.set(target, parents);
      }
    });
    
    // Step 3: Calculate positions with optimized horizontal priority
    // REDUCED gaps to make nodes closer together
    const horizontalGap = 270; // Reduced from 340 for closer node placement
    const verticalGap = 150;   // Reduced from 200 for closer vertical spacing
    
    // Track processed nodes
    const processed = new Set<string>();
    
    // Position map
    const positions = new Map<string, { x: number, y: number }>();
    
    // Collision detection - check if a position is already occupied
    const nodeWidth = 220; // Slightly reduced node width estimate
    const nodeHeight = 72; // Adjusted to match fixed node height
    
    // Check if a position would overlap with existing nodes
    const wouldOverlap = (x: number, y: number): boolean => {
      for (const [, pos] of positions.entries()) {
        // Check if rectangles overlap
        if (
          x < pos.x + nodeWidth &&
          x + nodeWidth > pos.x &&
          y < pos.y + nodeHeight &&
          y + nodeHeight > pos.y
        ) {
          return true;
        }
      }
      return false;
    };
    
    // Find a non-overlapping position near the target position
    const findNonOverlappingPosition = (targetX: number, targetY: number): { x: number, y: number } => {
      if (!wouldOverlap(targetX, targetY)) return { x: targetX, y: targetY };
      
      // Try positions in expanding rings around the target
      const spiralOffsets = [
        { dx: horizontalGap, dy: 0 },           // right
        { dx: 0, dy: verticalGap },             // down
        { dx: -horizontalGap, dy: 0 },          // left
        { dx: 0, dy: -verticalGap },            // up
        { dx: horizontalGap, dy: verticalGap }, // right-down diagonal
        { dx: -horizontalGap, dy: verticalGap },// left-down diagonal
        { dx: horizontalGap, dy: -verticalGap },// right-up diagonal
        { dx: -horizontalGap, dy: -verticalGap }// left-up diagonal
      ];
      
      for (let radius = 1; radius <= 3; radius++) {
        for (const offset of spiralOffsets) {
          const newX = targetX + offset.dx * radius;
          const newY = targetY + offset.dy * radius;
          if (!wouldOverlap(newX, newY)) {
            return { x: newX, y: newY };
          }
        }
      }
      
      // If all else fails, find a position below all existing nodes
      const maxY = Math.max(...Array.from(positions.values()).map(pos => pos.y), 0);
      return { x: targetX, y: maxY + verticalGap * 2 };
    };
    
    // Calculate layout row by row to minimize overlap
    // Track row assignments to keep related nodes in the same row when possible
    const nodeRows = new Map<string, number>();
    const rowPositions = new Map<number, number[]>(); // row -> x positions used
    
    // Process branch by assigning row and column positions
    const processNode = (nodeId: string, preferredX: number, preferredRow: number, visited = new Set<string>()) => {
      if (processed.has(nodeId) || visited.has(nodeId)) return;
      
      // Add to visited for this traversal (to prevent cycles)
      visited.add(nodeId);
      
      if (!processed.has(nodeId)) {
        // Assign node to preferred row if possible
        let row = preferredRow;
        
        // Find the best X position in this row that doesn't overlap
        const bestX = preferredX;
        
        // Try to find a position that doesn't conflict with existing nodes
        const possiblePosition = findNonOverlappingPosition(bestX, row * verticalGap);
        
        // Update row if needed
        if (possiblePosition.y !== row * verticalGap) {
          row = Math.round(possiblePosition.y / verticalGap);
        }
        
        // Update actual position
        const finalX = possiblePosition.x;
        const finalY = row * verticalGap;
        
        // Store the position
        positions.set(nodeId, { x: finalX, y: finalY });
        processed.add(nodeId);
        
        // Record row assignment and position
        nodeRows.set(nodeId, row);
        
        // Update row positions
        if (!rowPositions.has(row)) {
          rowPositions.set(row, []);
        }
        rowPositions.get(row)?.push(finalX);
        
        // Process children
        const children = childrenMap.get(nodeId) || [];
        
        if (children.length > 0) {
          // Sort children by number of their own children (ascending)
          // This places simpler branches first
          children.sort((a, b) => {
            const aChildren = childrenMap.get(a)?.length || 0;
            const bChildren = childrenMap.get(b)?.length || 0;
            return aChildren - bChildren;
          });
          
          // Determine if all children should be in the same row
          const allChildrenLinear = children.length <= 3 && 
                                   children.every(child => 
                                     (childrenMap.get(child)?.length || 0) <= 1 && 
                                     (parentMap.get(child)?.length || 0) <= 1);
          
          if (allChildrenLinear) {
            // Place all children in the same row, to the right
            let childX = finalX + horizontalGap;
            
            children.forEach(childId => {
              processNode(childId, childX, row, new Set(visited));
              childX += horizontalGap;
            });
          } else {
            // Distribute children across rows if needed
            children.forEach((childId, index) => {
              // Try to keep in same row if simple case, otherwise create branching rows
              const hasMultipleParents = (parentMap.get(childId)?.length || 0) > 1;
              const hasMultipleChildren = (childrenMap.get(childId)?.length || 0) > 1;
              
              if (!hasMultipleParents && !hasMultipleChildren && index === 0) {
                // First simple child - same row
                processNode(childId, finalX + horizontalGap, row, new Set(visited));
              } else {
                // Others go in rows below
                const childRow = row + 1 + index % 2; // Alternate between two rows below
                processNode(childId, finalX + horizontalGap/2 + index * horizontalGap/2, childRow, new Set(visited));
              }
            });
          }
        }
      }
    };
    
    // Start layout from root nodes
    let rootX = 100;
    rootNodes.forEach((rootNode, index) => {
      // Start each root branch with enough horizontal space
      const row = index % 3; // Distribute roots in up to 3 rows
      processNode(rootNode.id, rootX, row, new Set<string>());
      
      // Add spacing for next root node
      rootX += horizontalGap * 1.5;
    });
    
    // For any remaining unprocessed nodes (disconnected), arrange them in a row
    let disconnectedX = rootX + horizontalGap;
    let disconnectedRow = 0;
    
    nodes.forEach(node => {
      if (!processed.has(node.id)) {
        // Find a non-overlapping position for this node
        const pos = findNonOverlappingPosition(disconnectedX, disconnectedRow * verticalGap);
        positions.set(node.id, pos);
        
        // Update disconnected position for next node
        disconnectedX = pos.x + horizontalGap;
        disconnectedRow = Math.round(pos.y / verticalGap);
      }
    });
    
    // Build new nodes with calculated positions
    const newNodes = nodes.map(node => {
      const pos = positions.get(node.id) || { x: 0, y: 0 };
      return {
        ...node,
        position: pos
      };
    });
    
    setNodes(newNodes);
    
    // When auto-layout is explicitly requested, fit the view to show all nodes
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true });
    }, 100);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  // Store the current autoLayout function in a ref to avoid dependency cycles
  useEffect(() => {
    autoLayoutRef.current = applyAutoLayout;
  }, [applyAutoLayout]);

  // Handle global click handler for edge delete buttons
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle clicks on delete buttons
      if (target.closest('.edge-delete-button')) {
        const deleteButton = target.closest('.edge-delete-button') as HTMLElement;
        const edgeId = deleteButton.getAttribute('data-edge-id');
        
        if (edgeId) {
          e.preventDefault();
          e.stopPropagation();
          
          // Log the action for debugging
          console.log(`Global handler deleting connection with id: ${edgeId}`);
          
          // Use setTimeout to ensure the event completes before we modify state
          setTimeout(() => {
            // Clear selection first if this was the selected edge
            if (selectedElement?.id === edgeId) {
              setSelectedElement(null);
            }
            
            // Directly remove connection without animations
            removeConnection(edgeId);
          }, 0);
          
          // Show simple feedback toast
          const feedback = document.createElement('div');
          feedback.textContent = 'Connection deleted';
          feedback.className = 'fixed z-50 top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-md text-sm font-medium delete-toast';
          document.body.appendChild(feedback);
          
          // Remove feedback after delay
          setTimeout(() => {
            if (document.body.contains(feedback)) {
              document.body.removeChild(feedback);
            }
          }, 2000);
        }
      }
    };
    
    // Add event listener
    document.addEventListener('click', handleGlobalClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [removeConnection, selectedElement]);

  // Handle node state changes with highlighting for connection targets
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply the native onNodesChange
    onNodesChange(changes);
    
    // If we're connecting, check for nodes under the mouse and highlight them
    if (isConnecting) {
      const state = store.getState();
      
      // Get mouse position from store - note: the type is not correctly defined in ReactFlow
      // Using Record<string, unknown> as an intermediate type for better type safety
      const mousePosition = (state as Record<string, unknown>).mousePos as [number, number];
      
      if (!mousePosition) return;
      
      // Find node under mouse if we're connecting
      const nodeInternals = state.nodeInternals as Map<string, NodeWithPosition>;
      
      if (nodeInternals && nodeInternals.size > 0) {
        // Find node under cursor
        const nodeUnderMouse = [...nodeInternals.values()].find(n => {
          if (!n.positionAbsolute) return false;
          if (n.id === sourceNodeId) return false; // Skip source node
          
          const { x, y } = n.positionAbsolute;
          // Use estimated size if not available
          const width = n.positionAbsolute.width || 220;
          const height = n.positionAbsolute.height || 80;
          
          return (
            mousePosition[0] >= x &&
            mousePosition[0] <= x + width &&
            mousePosition[1] >= y &&
            mousePosition[1] <= y + height
          );
        });
        
        // Only highlight target nodes, not the source node
        const newTargetNodeId = nodeUnderMouse?.id || null;
        
        // Only update if the target node has changed to minimize re-renders
        if (newTargetNodeId !== targetNode) {
          setTargetNode(newTargetNodeId);
          
          // If there was a previous target node, update nodes to refresh its appearance
          if (targetNode || newTargetNodeId) {
            // This will trigger a re-render with the updated styling
            setNodes(nodes => 
              nodes.map(node => {
                // Apply or remove the connection-target class
                if (node.id === newTargetNodeId) {
                  // Add the connection target class to the node DOM element
                  setTimeout(() => {
                    const nodeElement = document.querySelector(`.react-flow__node[data-id="${node.id}"]`);
                    if (nodeElement) {
                      nodeElement.classList.add('connection-target');
                    }
                  }, 0);
                } else if (node.id === targetNode) {
                  // Remove the connection target class
                  setTimeout(() => {
                    const nodeElement = document.querySelector(`.react-flow__node[data-id="${node.id}"]`);
                    if (nodeElement) {
                      nodeElement.classList.remove('connection-target');
                    }
                  }, 0);
                }
                
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isConnectionTarget: node.id === newTargetNodeId
                  }
                };
              })
            );
          }
        }
      }
    } else if (targetNode) {
      // If we're not connecting anymore but there's still a target node, clear it
      setTargetNode(null);
      
      // Remove the connection-target class from all nodes
      setTimeout(() => {
        document.querySelectorAll('.connection-target').forEach(el => {
          el.classList.remove('connection-target');
        });
      }, 0);
    }
  }, [onNodesChange, isConnecting, store, sourceNodeId, targetNode, setNodes]);
  
  // Convert blocks to nodes
  useEffect(() => {
    if (blocks.length > 0) {
      // Sort blocks by order to ensure proper sequence
      const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
      
      // Create a grid layout with a reasonable number of columns
      const gridColumns = Math.min(4, Math.ceil(Math.sqrt(sortedBlocks.length)));
      const horizontalGap = 300; // Consistent with auto-layout
      const verticalGap = 180;   // Consistent with auto-layout
      
      const newNodes = sortedBlocks.map((block, index) => {
        // Calculate grid position (left-to-right, then top-to-bottom)
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
          selected: selectedElement?.id === block.id,
          data: { 
            block, 
            label: block.title || 'Untitled Block',
            isConnectionTarget: targetNode === block.id
          }
        };
      });
      
      setNodes(newNodes);
      
      // Apply auto-layout on initial load if we have multiple nodes and connections
      if (newNodes.length > 1 && connections.length > 0) {
        // We use a ref to ensure this only happens once
        const shouldAutoLayout = !hasAppliedInitialLayout.current;
        if (shouldAutoLayout) {
          hasAppliedInitialLayout.current = true;
          // Delay auto-layout to ensure all nodes are properly rendered
          setTimeout(() => autoLayoutRef.current(), 500);
        }
      }
    }
  }, [blocks, setNodes, targetNode, selectedElement?.id, connections])
  
  // Convert connections to edges
  useEffect(() => {
    if (connections.length > 0) {
      const newEdges = connections.map(connection => ({
        id: connection.id,
        source: connection.sourceId,
        target: connection.targetId,
        type: 'workflow',
        selected: selectedElement?.id === connection.id,
        data: { connection }
      }))
      setEdges(newEdges)
    } else {
      // If no connections, clear the edges
      setEdges([])
    }
  }, [connections, setEdges, selectedElement?.id])
  
  // Handle new connections
  const onConnect = useCallback(
    (connection: ReactFlowConnection) => {
      const newConnection: Connection = {
        id: uuidv4(),
        sourceId: connection.source!,
        targetId: connection.target!,
        order: connections.length
      }
      
      addConnection(newConnection)
      setEdges(edges => addEdge({
        ...connection,
        id: newConnection.id,
        type: 'workflow',
        data: { connection: newConnection }
      }, edges))
      
      // Auto-open the sidebar to edit the new connection
      const newEdge = {
        id: newConnection.id,
        source: connection.source!,
        target: connection.target!,
        data: { connection: newConnection }
      } as Edge<WorkflowEdgeData>;
      
      setSelectedElement(newEdge);
      
      // Reset target node highlighting
      setTargetNode(null);
      setSourceNodeId(null);
      setIsConnecting(false);
    },
    [addConnection, connections.length, setEdges]
  )
  
  // Handle connection start/end for guidance display
  const onConnectStart = useCallback((
    _event: React.MouseEvent | React.TouchEvent,
    params: { nodeId: string | null; handleId: string | null }
  ) => {
    setIsConnecting(true);
    // Remember source node ID but don't highlight it
    if (params.nodeId) {
      setSourceNodeId(params.nodeId);
      
      // Add a connecting attribute to the source node for CSS targeting
      setTimeout(() => {
        const sourceElement = document.querySelector(`.react-flow__node[data-id="${params.nodeId}"]`);
        if (sourceElement) {
          sourceElement.setAttribute('data-connecting', 'true');
        }
      }, 0);
    }
  }, []);
  
  const onConnectEnd = useCallback(() => {
    // Remove connecting state
    setIsConnecting(false);
    
    // Clean up connection visual states
    if (sourceNodeId) {
      // Remove connecting attribute from source node
      setTimeout(() => {
        const sourceElement = document.querySelector(`.react-flow__node[data-id="${sourceNodeId}"]`);
        if (sourceElement) {
          sourceElement.removeAttribute('data-connecting');
        }
        
        // Remove connection-target class from all nodes
        document.querySelectorAll('.connection-target').forEach(el => {
          el.classList.remove('connection-target');
        });
      }, 0);
    }
    
    // Reset state
    setTargetNode(null);
    setSourceNodeId(null);
  }, [sourceNodeId]);
  
  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedElement(node as Node<WorkflowNodeData>)
  }, [])
  
  // Handle edge selection
  const onEdgeClick: EdgeMouseHandler = useCallback((_, edge) => {
    setSelectedElement(edge as Edge<WorkflowEdgeData>)
  }, [])
  
  
  // Enhanced double-click handler for edges
  const handleEdgeDoubleClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Simply remove the connection directly
    if (edge.id) {
      console.log(`Double-click deleting connection with id: ${edge.id}`);
      
      // Use setTimeout to ensure the event completes before we modify state
      setTimeout(() => {
        // If this edge was selected, clear the selection first
        if (selectedElement?.id === edge.id) {
          setSelectedElement(null);
        }
        
        // Then remove the connection
        removeConnection(edge.id);
      }, 0);
      
      // Show feedback toast immediately
      const feedback = document.createElement('div');
      feedback.textContent = 'Connection deleted';
      feedback.className = 'fixed z-50 top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-md text-sm font-medium delete-toast';
      document.body.appendChild(feedback);
      
      // Remove feedback after delay
      setTimeout(() => {
        if (document.body.contains(feedback)) {
          document.body.removeChild(feedback);
        }
      }, 2000);
    }
  }, [removeConnection, selectedElement]);
  
  // Handle keyboard shortcuts - e.g., Escape to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to clear selection
      if (e.key === 'Escape' && selectedElement) {
        setSelectedElement(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement]);
  
  return (
    <div className="flex-1 flex h-full">
      <style>{flowAnimationStyles}</style>
      <div className="flex-1 h-full relative" ref={flowWrapperRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          onPaneClick={() => setSelectedElement(null)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }} // Default zoom slightly higher
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: true }}
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineComponent={CustomConnectionLine}
          connectionMode={ConnectionMode.Loose} // Makes connection more forgiving
          elementsSelectable={!isConnecting} // Disable selection while connecting
          snapToGrid={true}
          snapGrid={[15, 15]} // Snap to grid for more precise positioning
          deleteKeyCode={['Backspace', 'Delete']} // Allow deletion with keyboard
          className="workflow-canvas" // Add class for additional styling
          proOptions={{ hideAttribution: true }} // Hide ReactFlow attribution
          attributionPosition="bottom-right" // Position attribution in bottom-right
          minZoom={0.1} // Allow zooming out more
          maxZoom={2} // Limit zooming in
          edgesUpdatable={true} // Allow edge updates
          edgesFocusable={true} // Make edges focusable 
          elevateEdgesOnSelect={true} // Make selected edges appear above others
          selectNodesOnDrag={false} // Don't select nodes when dragging canvas
          panOnScroll={false} // Disable panning with scroll wheel
          zoomOnScroll={true} // Enable zooming with scroll wheel (default behavior)
          // panOnScrollMode removed due to type incompatibility
          nodesDraggable={true} // Allow nodes to be dragged
          nodesConnectable={true} // Allow nodes to be connected
          multiSelectionKeyCode={['Control', 'Meta']} // Multiple selection with Ctrl/Cmd
          autoPanOnNodeDrag={false} // Prevent auto-panning when dragging nodes to edges
          // fitViewOnInit removed - not supported in this version of ReactFlow
          onSelectionChange={() => {}} // Empty handler to prevent default behaviors
          preventScrolling={true} // Prevent scrolling of the page
          disableKeyboardA11y={true} // Disable keyboard accessibility features that might change view
        >
          <Background />
          <Controls />
          <WorkflowControls 
            onAutoLayout={applyAutoLayout} 
            onClearSelection={() => setSelectedElement(null)}
          />
          
          {/* Connection guidance tooltip */}
          {isConnecting && (
            <Panel position="top-center" className="bg-blue-50 p-3 rounded-md shadow-md border border-blue-200 mb-2">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="text-blue-500" size={18} />
                <p className="text-sm text-blue-700 font-medium">
                  Drag to another block to create a connection.
                </p>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
      
      {/* Always render the sidebar, passing selectedElement which may be null */}
      <WorkflowSidebar 
        element={selectedElement} 
        onClose={() => setSelectedElement(null)} 
      />
    </div>
  )
}