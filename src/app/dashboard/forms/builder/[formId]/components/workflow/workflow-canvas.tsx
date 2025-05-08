// src/app/dashboard/forms/builder/[formId]/components/workflow/workflow-canvas.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Background, 
  Controls,
  Panel,
  useReactFlow,
  ConnectionLineType,
  ConnectionMode
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useToast } from '@/components/ui/use-toast'
import { ArrowUpRight } from 'lucide-react'

// Import our components and types
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { useWorkflowData } from '@/hooks/workflow/use-workflow-data'
import { CustomConnectionLine } from './workflow-connection-line'
import WorkflowNode from './workflow-node'
import WorkflowEdge from './workflow-edge'
import WorkflowSidebar from './workflow-sidebar'
import WorkflowControls from './workflow-controls'
// Import workflow handlers
import { 
  useEdgeClickHandler, 
  useEdgeDoubleClickHandler,
  useNodeClickHandler,
  useConnectionHandler,
  useConnectionStartEndHandlers
} from './workflow-handlers'

// Register the node and edge types
const nodeTypes = { formBlock: WorkflowNode }
const edgeTypes = { workflow: WorkflowEdge }

// Use Tailwind CSS instead of global styles

export default function WorkflowCanvas() {
  // Get data and actions from form builder store
  const connections = useFormBuilderStore(state => state.connections || [])
  const removeConnection = useFormBuilderStore(state => state.removeConnection)
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId)
  const selectElement = useFormBuilderStore(state => state.selectElement)
  const isConnecting = useFormBuilderStore(state => state.isConnecting)
  const updateNodePositions = useFormBuilderStore(state => state.updateNodePositions)
  
  // Local UI state (only for things that don't affect other components)
  const [forceRefreshKey] = useState(0) 
  const [isLayouting, setIsLayouting] = useState(false)
  const [initialRenderComplete, setInitialRenderComplete] = useState(false)
  const { toast } = useToast()
  
  // We'll use Tailwind classes instead of global styles
  
  // Flow utilities
  const reactFlowInstance = useReactFlow()
  const flowWrapperRef = useRef<HTMLDivElement>(null)
  
  // Convert blocks/connections to nodes/edges
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    handleNodeDragStop,
    applyNodePositions
  } = useWorkflowData()
  
  // Use the handlers from workflow-handlers.ts
  // Node click handler
  const onNodeClick = useNodeClickHandler()
  
  // Edge click handler
  const onEdgeClick = useEdgeClickHandler()
  
  // Edge double click handler (delete connection)
  const handleEdgeDoubleClick = useEdgeDoubleClickHandler()
  
  // Connection handler
  const onConnect = useConnectionHandler()
  
  // Connection start/end handlers
  const { onConnectStart, onConnectEnd } = useConnectionStartEndHandlers()
  
  // Handle pane click (deselect everything)
  const handlePaneClick = useCallback(() => {
    selectElement(null)
  }, [selectElement])
  
  // Handle auto-layout
  const applyAutoLayout = useCallback(() => {
    if (!reactFlowInstance || isLayouting || nodes.length < 2) return
    
    setIsLayouting(true)
    
    try {
      // Simple auto-layout algorithm - position nodes in a horizontal line with vertical spacing for branches
      const positions: { [nodeId: string]: { x: number; y: number } } = {}
      const horizontalSpacing = 300
      const verticalSpacing = 100
      
      // First, create a map of source nodes to their target nodes
      const nodeConnections: { [sourceId: string]: string[] } = {}
      edges.forEach(edge => {
        if (!nodeConnections[edge.source]) {
          nodeConnections[edge.source] = []
        }
        nodeConnections[edge.source].push(edge.target)
      })
      
      // Find root nodes (nodes with no incoming connections)
      const hasIncoming = new Set<string>()
      edges.forEach(edge => hasIncoming.add(edge.target))
      
      const rootNodeIds = nodes
        .map(node => node.id)
        .filter(id => !hasIncoming.has(id))
      
      // If no root nodes found, use the first node or return
      if (rootNodeIds.length === 0) {
        if (nodes.length > 0) {
          rootNodeIds.push(nodes[0].id)
        } else {
          setIsLayouting(false)
          return
        }
      }
      
      // Process nodes level by level (breadth-first)
      const processedNodes = new Set<string>()
      const queue: { id: string; x: number; y: number }[] = rootNodeIds.map((id, index) => ({
        id,
        x: 100,
        y: index * (verticalSpacing * 1.5) + 100
      }))
      
      while (queue.length > 0) {
        const { id, x, y } = queue.shift()!
        
        if (processedNodes.has(id)) continue
        
        positions[id] = { x, y }
        processedNodes.add(id)
        
        // Process children
        const targets = nodeConnections[id] || []
        targets.forEach((targetId, index) => {
          if (!processedNodes.has(targetId)) {
            queue.push({
              id: targetId,
              x: x + horizontalSpacing,
              y: y + (index - (targets.length - 1) / 2) * verticalSpacing
            })
          }
        })
      }
      
      // Update positions for all nodes
      updateNodePositions(positions)
      applyNodePositions()
      
      // Center the viewport on the layout
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 })
        setIsLayouting(false)
      }, 500)
      
    } catch (error) {
      console.error('Error during auto layout:', error)
      setIsLayouting(false)
    }
  }, [nodes, edges, reactFlowInstance, isLayouting, updateNodePositions, applyNodePositions])
  
  // Apply initial layout on first render
  useEffect(() => {
    if (!initialRenderComplete && nodes.length > 0 && !isLayouting) {
      setInitialRenderComplete(true)
      
      // Check if we already have node positions
      const hasPositions = nodes.every(node => 
        node.position && 
        typeof node.position.x === 'number' && 
        typeof node.position.y === 'number'
      )
      
      // Only apply auto layout if we don't have positions
      if (!hasPositions) {
        setTimeout(() => {
          applyAutoLayout()
        }, 300)
      }
    }
  }, [nodes, applyAutoLayout, initialRenderComplete, isLayouting])
  
  // Handle keyboard shortcuts for deleting connections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Edges cannot be deleted via keyboard to prevent orphaned nodes
      // Even if an edge is selected and Delete or Backspace is pressed, we do nothing
      if (
        selectedElementId && 
        (e.key === 'Delete' || e.key === 'Backspace') && 
        connections.some(conn => conn.id === selectedElementId)
      ) {
        e.preventDefault()
        // Connection deletion disabled to prevent orphaned nodes
        // Just unselect the element
        selectElement(null)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementId, connections, removeConnection, selectElement])
  
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
    })
  }, [toast])
  
  return (
    <div className="flex-1 flex h-full">
      <div className="flex-1 h-full relative overflow-hidden" ref={flowWrapperRef}>
        <ReactFlow
          key={`flow-${forceRefreshKey}`}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          fitViewOptions={{ 
            padding: 0.2, 
            includeHiddenNodes: true,
            minZoom: 0.5, 
            maxZoom: 1.0
          }}
          connectionLineType={ConnectionLineType.Bezier}
          connectionLineComponent={CustomConnectionLine}
          connectionMode={ConnectionMode.Strict}
          elementsSelectable={true}
          snapToGrid={false}
          deleteKeyCode={['Backspace', 'Delete']}
          className="workflow-canvas"
          minZoom={0.1}
          maxZoom={2}
          edgesUpdatable={true}
          edgesFocusable={true}
          elevateEdgesOnSelect={true}
          selectNodesOnDrag={false}
          nodesDraggable={true}
          nodesConnectable={true}
          panOnScroll={false}
          zoomOnScroll={true}
          style={{
            // Apply styles that were previously in workflow-styles.ts as CSS vars
            '--edge-stroke-width': '1px',
            '--edge-path-stroke': '#000000',
            '--edge-curvature': '0.05'
          } as React.CSSProperties}
        >
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
      
      {/* Sidebar for editing selected elements */}
      <WorkflowSidebar />
    </div>
  )
}
