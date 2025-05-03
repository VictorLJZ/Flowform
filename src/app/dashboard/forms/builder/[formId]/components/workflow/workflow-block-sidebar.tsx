"use client"

import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Node, Edge, useEdges } from 'reactflow'
import { WorkflowNodeData } from '@/types/workflow-types'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save, Edit2, X } from 'lucide-react'

interface WorkflowBlockSidebarProps {
  element: Node<WorkflowNodeData>;
  onHasChanges?: (hasChanges: boolean) => void;
}

export default function WorkflowBlockSidebar({ element, onHasChanges }: WorkflowBlockSidebarProps) {
  const blocks = useFormBuilderStore(state => state.blocks)
  const updateBlock = useFormBuilderStore(state => state.updateBlock)
  const edges = useEdges()
  
  const [editMode, setEditMode] = useState(false)
  const [title, setTitle] = useState(element?.data?.block?.title || '')
  const [description, setDescription] = useState(element?.data?.block?.description || '')
  
  // Update state when element changes
  useEffect(() => {
    setTitle(element?.data?.block?.title || '')
    setDescription(element?.data?.block?.description || '')
    setEditMode(false)
  }, [element?.id, element?.data?.block])
  
  // Get incoming and outgoing connections for node
  const getIncomingConnections = () => {
    return edges.filter(e => e.target === element.id);
  }
  
  const getOutgoingConnections = () => {
    return edges.filter(e => e.source === element.id);
  }
  
  // Save changes to the block
  const saveChanges = () => {
    if (element?.data?.block?.id) {
      updateBlock(element.data.block.id, {
        title,
        description
      })
      setEditMode(false)
      // Notify parent component that changes were made
      if (onHasChanges) {
        onHasChanges(true)
      }
    }
  }
  
  // Cancel editing and reset values
  const cancelEdit = () => {
    setTitle(element?.data?.block?.title || '')
    setDescription(element?.data?.block?.description || '')
    setEditMode(false)
  }
  
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-5">
        <Card>
          <CardHeader className="py-3 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Block Information</CardTitle>
              {!editMode ? (
                <Button variant="ghost" size="icon" onClick={() => setEditMode(true)} 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground">
                  <Edit2 size={14} />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={cancelEdit} 
                          className="h-6 w-6 text-muted-foreground hover:text-red-500">
                    <X size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={saveChanges} 
                          className="h-6 w-6 text-muted-foreground hover:text-green-500">
                    <Save size={14} />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 py-3 space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">TITLE</Label>
              {!editMode ? (
                <div className="text-sm bg-muted py-2 px-3 rounded-md">
                  {element?.data?.block?.title || 'Untitled'}
                </div>
              ) : (
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-sm h-9"
                  placeholder="Enter block title"
                />
              )}
            </div>
            
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">TYPE</Label>
              <div className="text-sm bg-muted py-2 px-3 rounded-md capitalize">
                {element?.data?.block?.blockTypeId?.replace('_', ' ') || 'Unknown'}
              </div>
            </div>
            
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">DESCRIPTION</Label>
              {!editMode ? (
                <div className="text-sm bg-muted py-2 px-3 rounded-md min-h-[36px]">
                  {element?.data?.block?.description || <span className="text-muted-foreground italic">No description</span>}
                </div>
              ) : (
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm min-h-[60px] resize-none"
                  placeholder="Enter block description"
                />
              )}
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