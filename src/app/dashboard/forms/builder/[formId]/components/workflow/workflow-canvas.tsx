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
  PanelPosition,
  useStoreApi,
  NodeChange,
  EdgeChange,
  ConnectionMode,
  XYPosition
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
  const controlPointX1 = fromX + 100;
  const controlPointY1 = fromY;
  const controlPointX2 = toX - 100;
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

  /* Improved handle styles - smaller but more interactive */
  .react-flow__handle {
    opacity: 1;
    cursor: pointer;
    transition: all 0.2s;
    width: 10px !important;
    height: 10px !important;
    border-width: 2px !important;
    border-color: white !important;
    background-color: black !important;
    position: absolute;
  }
  
  /* Handle hover state - grow slightly for better "stickiness" */
  .react-flow__handle:hover {
    width: 14px !important;
    height: 14px !important;
    box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
    z-index: 10;
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

  /* Connection interaction improvements */
  .react-flow__handle.connecting {
    background-color: #f59e0b !important;
  }
  
  .react-flow__handle.valid {
    background-color: #10b981 !important;
  }
  
  /* When connecting, highlight valid connection targets */
  .react-flow__node[data-connecting="true"] .react-flow__handle {
    opacity: 1;
    transform: scale(1.2);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.3); }
    70% { box-shadow: 0 0 0 6px rgba(0, 0, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
  }

  /* Edge delete animations */
  @keyframes deleteButtonPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
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

  /* Apply animation to delete button on hover */
  .edge-delete-button:hover {
    animation: deleteButtonPulse 0.5s ease-in-out infinite;
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

  // Effect to add global click handler for delete buttons
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle clicks on delete buttons
      if (target.closest('.edge-delete-button')) {
        const deleteButton = target.closest('.edge-delete-button') as HTMLElement;
        const edgeId = deleteButton.getAttribute('data-edge-id');
        
        if (edgeId) {
          // Find the edge
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            e.preventDefault();
            e.stopPropagation();
            
            // Apply deletion effect
            const edgeElement = document.querySelector(`.react-flow__edge[data-edge-id="${edgeId}"]`);
            if (edgeElement) {
              edgeElement.classList.add('deleting');
            }
            
            // Short delay for animation
            setTimeout(() => {
              removeConnection(edgeId);
              
              // Clear selection if this was the selected edge
              if (selectedElement?.id === edgeId) {
                setSelectedElement(null);
              }
              
              // Show feedback
              const feedback = document.createElement('div');
              feedback.textContent = 'Connection deleted';
              feedback.className = 'fixed z-50 top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-md text-sm font-medium delete-toast';
              document.body.appendChild(feedback);
              
              // Remove feedback after delay
              setTimeout(() => {
                feedback.style.opacity = '0';
                feedback.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                  if (document.body.contains(feedback)) {
                    document.body.removeChild(feedback);
                  }
                }, 500);
              }, 1500);
            }, 100);
          }
        }
      }
    };
    
    // Add event listener
    document.addEventListener('click', handleGlobalClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [edges, removeConnection, selectedElement]);

  // Handle node state changes with highlighting for connection targets
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply the native onNodesChange
    onNodesChange(changes);
    
    // If we're connecting, check for nodes under the mouse and highlight them
    if (isConnecting) {
      const state = store.getState();
      
      // Get mouse position from store - note: the type is not correctly defined in ReactFlow
      const mousePosition = (state as any).mousePos as [number, number];
      
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
              nodes.map(node => ({
                ...node,
                data: {
                  ...node.data,
                  isConnectionTarget: node.id === newTargetNodeId
                }
              }))
            );
          }
        }
      }
    }
  }, [onNodesChange, isConnecting, store, sourceNodeId, targetNode, setNodes]);
  
  // Convert blocks to nodes
  useEffect(() => {
    if (blocks.length > 0) {
      const newNodes = blocks.map((block, index) => ({
        id: block.id,
        type: 'formBlock',
        position: { x: index * 300, y: 100 }, // Horizontal layout (left to right)
        selected: selectedElement?.id === block.id,
        data: { 
          block, 
          label: block.title || 'Untitled Block',
          isConnectionTarget: targetNode === block.id
        }
      }))
      setNodes(newNodes)
    }
  }, [blocks, setNodes, targetNode, selectedElement?.id])
  
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
    }
  }, [connections, setEdges, selectedElement?.id])
  
  // Apply improved auto-layout with more horizontal positioning
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
    
    // Step 3: Calculate positions with horizontal priority
    const horizontalGap = 320; // Wider gap to accommodate edge labels
    const verticalGap = 200;   // Taller to give more space for edge labels
    
    // Track processed nodes
    const processed = new Set<string>();
    
    // Position map
    const positions = new Map<string, { x: number, y: number }>();
    
    // Calculate maximal branch width
    const getBranchWidth = (nodeId: string, visited = new Set<string>()): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);
      
      const children = childrenMap.get(nodeId) || [];
      if (children.length === 0) return 1;
      
      return Math.max(1, children.reduce((sum, childId) => 
        sum + getBranchWidth(childId, new Set(visited)), 0));
    };
    
    // Process a branch (recursive)
    const processNode = (nodeId: string, x: number, y: number, visited = new Set<string>()) => {
      if (processed.has(nodeId) || visited.has(nodeId)) return;
      
      // Add to visited for this traversal (to prevent cycles)
      visited.add(nodeId);
      
      // Only process once
      if (!processed.has(nodeId)) {
        positions.set(nodeId, { x, y });
        processed.add(nodeId);
        
        const children = childrenMap.get(nodeId) || [];
        
        if (children.length > 0) {
          // Special case: if one child, keep it in the same horizontal line if possible
          if (children.length === 1 && !parentMap.get(children[0])?.some(p => p !== nodeId && !processed.has(p))) {
            processNode(children[0], x + horizontalGap, y, new Set(visited));
          } else {
            // Position children horizontally when possible
            let canArrangeHorizontally = true;
            
            // Check if any child has multiple parents or if any child's parent is not processed
            for (const childId of children) {
              const childParents = parentMap.get(childId) || [];
              if (childParents.length > 1 || childParents.some(p => p !== nodeId && !processed.has(p))) {
                canArrangeHorizontally = false;
                break;
              }
            }
            
            if (canArrangeHorizontally) {
              // Arrange children horizontally next to each other
              let offsetX = x + horizontalGap;
              for (const childId of children) {
                processNode(childId, offsetX, y, new Set(visited));
                offsetX += horizontalGap;
              }
            } else {
              // Arrange in a more traditional tree structure with vertical offsets
              const totalWidth = Math.max(1, getBranchWidth(nodeId, new Set<string>()));
              const startX = x - (totalWidth - 1) * horizontalGap / 2;
              
              children.forEach((childId, index) => {
                const childWidth = getBranchWidth(childId, new Set<string>());
                const childStartX = startX + index * horizontalGap;
                processNode(childId, childStartX, y + verticalGap, new Set(visited));
              });
            }
          }
        }
      }
    };
    
    // Start layout from root nodes
    let rootX = 100;
    rootNodes.forEach(rootNode => {
      processNode(rootNode.id, rootX, 100, new Set<string>());
      
      // Get width of this branch to space out the next root
      const branchWidth = getBranchWidth(rootNode.id, new Set<string>());
      rootX += horizontalGap * (branchWidth + 1);
    });
    
    // For any remaining unprocessed nodes (disconnected), arrange them in a row
    let disconnectedX = rootX;
    nodes.forEach(node => {
      if (!processed.has(node.id)) {
        positions.set(node.id, { x: disconnectedX, y: 100 });
        disconnectedX += horizontalGap;
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
    
    // Center view on the nodes
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 50);
  }, [nodes, edges, setNodes, reactFlowInstance]);
  
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
    }
  }, []);
  
  const onConnectEnd = useCallback(() => {
    setIsConnecting(false);
    // Remove any highlighting
    setTargetNode(null);
    setSourceNodeId(null);
  }, []);
  
  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedElement(node as Node<WorkflowNodeData>)
  }, [])
  
  // Handle edge selection
  const onEdgeClick: EdgeMouseHandler = useCallback((_, edge) => {
    setSelectedElement(edge as Edge<WorkflowEdgeData>)
  }, [])
  
  // Handle edge deletion
  const onEdgeDelete = useCallback(
    (edge: Edge<WorkflowEdgeData>) => {
      removeConnection(edge.id)
      
      // If this edge was selected, clear the selection to close any sidebar
      if (selectedElement?.id === edge.id) {
        setSelectedElement(null)
      }
    },
    [removeConnection, selectedElement]
  )
  
  // Enhanced double-click handler for edges
  const handleEdgeDoubleClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Find the edge element directly using more reliable query
    const edgeElement = document.querySelector(`.react-flow__edge[data-edge-id="${edge.id}"]`);
    
    if (edgeElement) {
      // Apply fade-out animation
      edgeElement.classList.add('deleting');
      
      // Add a data attribute to indicate deletion in progress
      edgeElement.setAttribute('data-deleting', 'true');
      
      // Short delay to allow animation to play before actual deletion
      setTimeout(() => {
        // Only delete if the element is still marked for deletion
        // (prevents issues when double-clicking too fast)
        if (edgeElement.getAttribute('data-deleting') === 'true') {
          // Perform edge deletion
          onEdgeDelete(edge);
          
          // Provide visual feedback with animation
          const feedback = document.createElement('div');
          feedback.textContent = 'Connection deleted';
          feedback.className = 'fixed z-50 top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-md text-sm font-medium delete-toast';
          document.body.appendChild(feedback);
          
          // Remove feedback after a delay
          setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
              if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
              }
            }, 500);
          }, 1500);
        }
      }, 100); // Reduced delay for faster response
    } else {
      // Fallback if element not found
      onEdgeDelete(edge);
    }
  }, [onEdgeDelete]);
  
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
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.3 }} // Default zoom out to 0.3
          fitView
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineComponent={CustomConnectionLine}
          connectionMode={ConnectionMode.Loose} // Makes connection more forgiving
          elementsSelectable={!isConnecting} // Disable selection while connecting
          snapToGrid={true}
          snapGrid={[15, 15]} // Snap to grid for more precise positioning
          deleteKeyCode={['Backspace', 'Delete']} // Allow deletion with keyboard
          className="workflow-canvas" // Add class for additional styling
        >
          <Background />
          <Controls />
          <WorkflowControls onAutoLayout={applyAutoLayout} />
          
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
      
      {selectedElement && (
        <WorkflowSidebar 
          element={selectedElement} 
          onClose={() => setSelectedElement(null)} 
        />
      )}
    </div>
  )
}