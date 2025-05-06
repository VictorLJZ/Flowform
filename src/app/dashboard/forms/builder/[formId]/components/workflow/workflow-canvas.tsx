// src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-canvas.tsx
"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background, 
  Controls,
  Node,
  Edge,
  Panel,
  useReactFlow,
  ConnectionLineType,
  useStoreApi,
  ConnectionMode
} from 'reactflow'
import 'reactflow/dist/style.css' // Ensure the default styles are loaded
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { WorkflowNodeData, WorkflowEdgeData } from '@/types/workflow-types'
import { ArrowUpRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Import our extracted components and utilities
import { CustomConnectionLine } from './workflow-connection-line'
import WorkflowNode from './workflow-node'
import WorkflowEdge from './workflow-edge'
import WorkflowSidebar from './workflow-sidebar'
import WorkflowControls from './workflow-controls'
import { useWorkflowData } from '@/hooks/workflow'
import { calculateLayout } from './workflow-layout'
import { flowAnimationStyles } from './workflow-styles'
import { 
  useNodeClickHandler,
  useEdgeClickHandler,
  useEdgeDoubleClickHandler,
  useConnectionHandler,
  useConnectionStartEndHandlers,
  useNodeChangeHandler
} from './workflow-handlers'

// Register the node and edge types
const nodeTypes = { formBlock: WorkflowNode }
const edgeTypes = { workflow: WorkflowEdge }

// Global styles to ensure edges are always visible
const globalStyles = `
  .react-flow__edge {
    pointer-events: all !important;
    z-index: 5 !important;
  }
  
  .react-flow__edge path {
    stroke-width: 2px !important;
  }
  
  .react-flow__edge.selected {
    z-index: 10 !important;
  }
  
  .react-flow__edge.selected path {
    stroke-width: 3px !important;
  }
`;

export default function WorkflowCanvas() {
  // Get data from form builder store
  const blocks = useFormBuilderStore(state => state.blocks || [])
  const connections = useFormBuilderStore(state => state.connections || [])
  const addConnection = useFormBuilderStore(state => state.addConnection)
  const removeConnection = useFormBuilderStore(state => state.removeConnection)
  
  // UI state
  const [selectedElement, setSelectedElement] = useState<Node<WorkflowNodeData> | Edge<WorkflowEdgeData> | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [targetNode, setTargetNode] = useState<string | null>(null)
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null)
  const [initialRenderComplete, setInitialRenderComplete] = useState(false)
  const [forceRefreshKey, setForceRefreshKey] = useState(0) // Key for forcing complete re-render
  const [isLayouting, setIsLayouting] = useState(false) // State to prevent multiple layout operations
  const { toast } = useToast()
  
  // Add the global styles on component mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Flow utilities
  const reactFlowInstance = useReactFlow()
  const store = useStoreApi()
  const flowWrapperRef = useRef<HTMLDivElement>(null)
  
  // Convert blocks/connections to nodes/edges
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    applyNodePositions
  } = useWorkflowData({
    blocks,
    connections,
    selectedElementId: selectedElement?.id || null,
    targetNodeId: targetNode
  })
  
  // Define event handlers
  const onNodeClick = useNodeClickHandler(setSelectedElement)
  const onEdgeClick = useEdgeClickHandler(setSelectedElement)
  const handleEdgeDoubleClick = useEdgeDoubleClickHandler(
    removeConnection, 
    selectedElement, 
    setSelectedElement
  )
  
  const onConnect = useConnectionHandler(
    addConnection,
    connections,
    setEdges,
    setSelectedElement,
    setTargetNode,
    setSourceNodeId,
    setIsConnecting
  )
  
  const { onConnectStart, onConnectEnd } = useConnectionStartEndHandlers(
    setIsConnecting,
    setSourceNodeId,
    setTargetNode
  )
  
  const handleNodesChange = useNodeChangeHandler(
    onNodesChange,
    isConnecting,
    store,
    sourceNodeId,
    targetNode,
    setTargetNode,
    setNodes
  )
  
  // Auto-layout function - Only applied when button is clicked
  const applyAutoLayout = useCallback(() => {
    if (!nodes || nodes.length === 0 || isLayouting) return;
    
    try {
      // Prevent multiple layout operations
      setIsLayouting(true);
      
      // Calculate positions using our extracted layout algorithm
      const positions = calculateLayout(nodes, edges);
      
      // Apply positions to nodes
      applyNodePositions(positions);
      
      // Single timeout for all post-layout operations
      setTimeout(() => {
        if (reactFlowInstance) {
          // Fit view to show all nodes with consistent zoom
          reactFlowInstance.fitView({ 
            padding: 0.2, 
            includeHiddenNodes: true,
            minZoom: 0.5,
            maxZoom: 1.0
          });
          
          // Force a single redraw after layout
          setForceRefreshKey(prev => prev + 1);
        }
        
        // Allow layout operations again
        setIsLayouting(false);
      }, 300);
    } catch (error) {
      console.error('Error applying auto layout:', error);
      setIsLayouting(false);
    }
  }, [nodes, edges, applyNodePositions, reactFlowInstance, isLayouting]);
  
  // Handle global click handler for edge delete buttons
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Handle clicks on delete buttons
      if (target.closest('.edge-delete-button')) {
        const deleteButton = target.closest('.edge-delete-button') as HTMLElement
        const edgeId = deleteButton.getAttribute('data-edge-id')
        
        if (edgeId) {
          e.preventDefault()
          e.stopPropagation()
          
          console.log(`Global handler deleting connection with id: ${edgeId}`)
          
          // Use setTimeout to ensure the event completes before we modify state
          setTimeout(() => {
            try {
              // Clear selection first if this was the selected edge
              if (selectedElement?.id === edgeId) {
                setSelectedElement(null)
              }
              
              // Directly remove connection 
              removeConnection(edgeId)
              
              // Force refresh after deletion to ensure UI updates correctly
              setTimeout(() => {
                setForceRefreshKey(prev => prev + 1);
              }, 100);
            } catch (error) {
              console.error('Error handling edge deletion:', error);
            }
          }, 0)
        }
      }
    }
    
    // Add event listener
    document.addEventListener('click', handleGlobalClick)
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [removeConnection, selectedElement])
  
  // Handle keyboard shortcuts - Escape to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedElement) {
        setSelectedElement(null)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedElement])
  
  // Handle clicking on the empty canvas area
  const handlePaneClick = useCallback(() => {
    // Clear the selected element
    setSelectedElement(null)
    
    // Reset any other UI state related to selection
    setTargetNode(null)
    
    // Ensure ReactFlow knows we're not in connecting mode
    setIsConnecting(false)
    
    // Set the current viewport without changing it (refreshes the view)
    if (reactFlowInstance) {
      try {
        const currentViewport = reactFlowInstance.getViewport();
        reactFlowInstance.setViewport(currentViewport);
      } catch (error) {
        console.error('Error refreshing viewport on pane click:', error);
      }
    }
  }, [reactFlowInstance, setSelectedElement, setTargetNode, setIsConnecting]);
  
  // Enhanced edge refresh - monitor both connections length and the actual edges array
  useEffect(() => {
    // Only trigger a refresh after a reasonable delay
    const refreshTimer = setTimeout(() => {
      // Just trigger a refresh without changing the view position
      if (reactFlowInstance) {
        try {
          const currentViewport = reactFlowInstance.getViewport();
          reactFlowInstance.setViewport({
            x: currentViewport.x,
            y: currentViewport.y, 
            zoom: currentViewport.zoom
          });
        } catch (error) {
          console.error('Error refreshing viewport:', error);
        }
      }
    }, 300);
    
    return () => clearTimeout(refreshTimer);
  }, [connections.length, edges.length, reactFlowInstance, forceRefreshKey]);
  
  // FIX: Zoom to fit content ONLY on initial load, not on selection changes
  useEffect(() => {
    if (!initialRenderComplete && nodes.length > 1 && !nodes.some(n => !n.position) && !isLayouting) {
      // Prevent multiple layout operations during initial load
      setIsLayouting(true);
      
      // Only fit the view on initial load
      try {
        // First try to use stored positions
        let hasStoredPositions = nodes.some(n => n.position.x !== 0 && n.position.y !== 0);
        
        if (!hasStoredPositions) {
          // If no stored positions, apply auto-layout to organize nodes
          console.log('Applying initial auto layout');
          const positions = calculateLayout(nodes, edges);
          applyNodePositions(positions);
        }
        
        // Single timeout for all post-layout operations
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({
              padding: 0.2,
              includeHiddenNodes: true,
              minZoom: 0.5,
              maxZoom: 1.0
            });
            
            // Force a single redraw after layout and mark as complete
            setForceRefreshKey(prev => prev + 1);
            setInitialRenderComplete(true);
            console.log('Initial layout complete');
          }
          
          // Allow layout operations again
          setIsLayouting(false);
        }, 300);
      } catch (error) {
        console.error('Error during initial layout:', error);
        // Set initialRenderComplete anyway to avoid retries
        setInitialRenderComplete(true);
        setIsLayouting(false);
      }
    }
  }, [nodes.length, reactFlowInstance, initialRenderComplete, edges, applyNodePositions, isLayouting, nodes]);
  
  // Help dialog handler
  const handleHelp = useCallback(() => {
    toast({
      title: "Workflow Tips",
      description: (
        <div className="space-y-2 mt-2">
          <p>1. Connect blocks by dragging from right handle to left handle</p>
          <p>2. Double-click a connection to delete it</p>
          <p>3. Click a connection to edit its conditions</p>
          <p>4. Use Auto Layout to organize your flow</p>
        </div>
      ),
      duration: 7000,
    });
  }, [toast]);

  return (
    <div className="flex-1 flex h-full">
      {/* Custom styles for workflow edges and nodes */}
      <style>{flowAnimationStyles}</style>
      
      <div className="flex-1 h-full relative overflow-hidden" ref={flowWrapperRef}>
        <ReactFlow
          key={`flow-${forceRefreshKey}`} // Force full re-render when key changes
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
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }} // Increased default zoom
          fitViewOptions={{ 
            padding: 0.2, 
            includeHiddenNodes: true,
            minZoom: 0.5, 
            maxZoom: 1.0
          }}
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineComponent={CustomConnectionLine}
          connectionMode={ConnectionMode.Loose}
          elementsSelectable={!isConnecting}
          snapToGrid={false} // Disable snap to grid for smoother dragging
          deleteKeyCode={['Backspace', 'Delete']}
          className="workflow-canvas"
          proOptions={{ 
            hideAttribution: true,
            account: 'paid' // This enables better performance optimizations
          }}
          attributionPosition="bottom-right"
          minZoom={0.1}
          maxZoom={2}
          edgesUpdatable={true}
          edgesFocusable={true}
          elevateEdgesOnSelect={true} // Changed to true to improve edge visibility
          selectNodesOnDrag={false}
          panOnScroll={false} // Disable pan on scroll to make zoom the default
          zoomOnScroll={true} // Make zoom the default scroll behavior
        >
          {/* Use absolute positioning for controls to avoid ReactFlow Panel issues */}
          <WorkflowControls 
            onAutoLayout={applyAutoLayout}
            onHelp={handleHelp}
          />
          
          <Background />
          <Controls position="bottom-left" />
          
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
      
      {/* Moved sidebar outside of ReactFlow to be always visible */}
      <WorkflowSidebar
        element={selectedElement}
        onClose={() => setSelectedElement(null)}
      />
    </div>
  )
}