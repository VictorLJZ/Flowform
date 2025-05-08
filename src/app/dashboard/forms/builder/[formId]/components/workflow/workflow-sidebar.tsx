"use client"

import { useState, useEffect } from 'react'
import { X, Save, Info, Settings, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Node } from 'reactflow'
import { WorkflowNodeData } from '@/types/workflow-types'
import WorkflowConnectionSidebar from './workflow-connection-sidebar'
import WorkflowBlockSidebar from './workflow-block-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFormBuilderStore } from '@/stores/formBuilderStore'

export default function WorkflowSidebar() {
  const [hasChanges, setHasChanges] = useState(false)
  const blocks = useFormBuilderStore(state => state.blocks)
  const connections = useFormBuilderStore(state => state.connections)
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId)
  const selectElement = useFormBuilderStore(state => state.selectElement)
  
  // Find the selected element from either blocks or connections
  const element = selectedElementId
    ? connections.find(conn => conn.id === selectedElementId) ||
      (blocks.find(block => block.id === selectedElementId) 
        ? {
            id: selectedElementId,
            type: 'formBlock',
            data: { block: blocks.find(block => block.id === selectedElementId) },
            position: { x: 0, y: 0 }
          } as Node<WorkflowNodeData>
        : null)
    : null
  
  // Determine if the element is an edge (connection) or a node (block)
  // Connections in the store have sourceId/targetId properties (not source/target as in ReactFlow)
  const isEdge = element && ('sourceId' in element || 'source' in element) && ('targetId' in element || 'target' in element)
  const isNode = element && !isEdge
  
  // Log selection status for debugging
  if (selectedElementId) {
    console.log(`🔍 SELECTION: Element ID ${selectedElementId} is ${isEdge ? 'an edge' : isNode ? 'a node' : 'unknown type'}`)
  }
  
  // Check if the selected edge still exists in the connections store
  const edgeExists = isEdge && connections.some(conn => conn.id === element.id)
  
  // Check if the selected block still exists in the blocks store
  const nodeExists = isNode && blocks.some(block => block.id === element.id)
  
  if (selectedElementId && isEdge) {
    console.log(`🔄 EDGE CHECK: Edge ${element.id} exists in connections: ${edgeExists ? 'YES' : 'NO'}`)
  }
  
  // If element doesn't exist anymore, we should show the default view
  const effectiveElement = isEdge 
    ? (edgeExists ? element : null) 
    : (nodeExists ? element : null)
  
  // Reset when the element changes
  useEffect(() => {
    setHasChanges(false)
  }, [element?.id])
  
  // Watch for changes in connections and blocks
  // This ensures we show the default view if the selected element is deleted
  useEffect(() => {
    if (isEdge && !edgeExists) {
      console.log('Selected edge no longer exists in connections, showing default view');
      selectElement(null); // Clear selected element since it no longer exists
    }
    
    if (isNode && !nodeExists) {
      console.log('Selected block no longer exists in blocks, showing default view');
      selectElement(null); // Clear selected element since it no longer exists
    }
  }, [connections, blocks, isEdge, edgeExists, isNode, nodeExists, selectElement]);
  
  // Render the default overview when no element is selected
  const renderDefaultOverview = () => {
    return (
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Workflow Overview</CardTitle>
              <CardDescription className="text-xs">
                Select a block or connection to view and edit its properties
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-3 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-700">Elements</span>
                <div className="flex gap-2">
                  <span className="text-xs bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {blocks.length} Blocks
                  </span>
                  <span className="text-xs bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {connections.length} Connections
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  <Info size={14} className="inline-block mr-1" />
                  Click on any block or connection to edit its properties.
                </p>
                <p className="text-xs text-muted-foreground">
                  <Settings size={14} className="inline-block mr-1" />
                  Customize the workflow by adding connections between blocks.
                </p>
                <p className="text-xs text-muted-foreground">
                  <ArrowRight size={14} className="inline-block mr-1" />
                  Drag between the handles to create new connections.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    )
  }
  
  return (
    <div className="w-[420px] border-l bg-background flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h2 className="font-medium">
          {!effectiveElement ? 'Workflow' : (isEdge && edgeExists ? 'Connection Settings' : 'Block Settings')}
        </h2>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
              <Save size={14} className="mr-1" /> Applied
            </Button>
          )}
          {effectiveElement && (
            <Button variant="ghost" size="icon" onClick={() => selectElement(null)}>
              <X size={18} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {!effectiveElement ? (
          renderDefaultOverview()
        ) : isEdge && edgeExists ? (
          <WorkflowConnectionSidebar />
        ) : (
          <WorkflowBlockSidebar />
        )}
      </div>
    </div>
  )
}