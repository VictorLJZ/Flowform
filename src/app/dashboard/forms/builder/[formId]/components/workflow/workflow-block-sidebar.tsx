"use client"

import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Node, Edge, useEdges } from 'reactflow'
import { WorkflowNodeData } from '@/types/workflow-types'
import { useFormBuilderStore } from '@/stores/formBuilderStore'

interface WorkflowBlockSidebarProps {
  element: Node<WorkflowNodeData>;
}

export default function WorkflowBlockSidebar({ element }: WorkflowBlockSidebarProps) {
  const blocks = useFormBuilderStore(state => state.blocks)
  const edges = useEdges()
  
  // Get incoming and outgoing connections for node
  const getIncomingConnections = () => {
    return edges.filter(e => e.target === element.id);
  }
  
  const getOutgoingConnections = () => {
    return edges.filter(e => e.source === element.id);
  }
  
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-5">
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Block Information</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-3 space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">TITLE</Label>
              <div className="text-sm bg-muted py-2 px-3 rounded-md">
                {element?.data?.block?.title || 'Untitled'}
              </div>
            </div>
            
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">TYPE</Label>
              <div className="text-sm bg-muted py-2 px-3 rounded-md capitalize">
                {element?.data?.block?.blockTypeId?.replace('_', ' ') || 'Unknown'}
              </div>
            </div>
            
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">DESCRIPTION</Label>
              <div className="text-sm bg-muted py-2 px-3 rounded-md min-h-[36px]">
                {element?.data?.block?.description || <span className="text-muted-foreground italic">No description</span>}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-100">
          <CardHeader className="py-3 px-4 bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-sm">Workflow Connections</CardTitle>
            <CardDescription className="text-xs">
              View incoming and outgoing connections for this block
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-3 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-blue-700">Connections Summary</span>
              <div className="flex gap-2">
                <span className="text-xs bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  {getIncomingConnections().length} Incoming
                </span>
                <span className="text-xs bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  {getOutgoingConnections().length} Outgoing
                </span>
              </div>
            </div>
            
            <Separator className="my-1" />
            
            <div>
              <Label className="mb-2 block text-xs font-medium">Incoming Connections</Label>
              <div className="space-y-2 max-h-24 overflow-auto">
                {getIncomingConnections().length > 0 ? (
                  getIncomingConnections().map((e: Edge) => (
                    <div key={e.id} className="text-xs bg-muted py-1.5 px-3 rounded-md flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      {blocks.find(b => b.id === e.source)?.title || 'Unknown Block'}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic px-2">No incoming connections</p>
                )}
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block text-xs font-medium">Outgoing Connections</Label>
              <div className="space-y-2 max-h-24 overflow-auto">
                {getOutgoingConnections().length > 0 ? (
                  getOutgoingConnections().map((e: Edge) => (
                    <div key={e.id} className="text-xs bg-muted py-1.5 px-3 rounded-md flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      {blocks.find(b => b.id === e.target)?.title || 'Unknown Block'}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic px-2">No outgoing connections</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
} 