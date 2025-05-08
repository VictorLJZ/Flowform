"use client"

import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEdges, Edge } from 'reactflow'
// Removed unused imports
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save, Edit2, X } from 'lucide-react'

export default function WorkflowBlockSidebar() {
  // Place ALL hooks at the top level of the component to comply with React rules
  const blocks = useFormBuilderStore(state => state.blocks)
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId)
  const updateBlock = useFormBuilderStore(state => state.updateBlock)
  const saveForm = useFormBuilderStore(state => state.saveForm)
  const edges = useEdges()
  
  // All state hooks must be declared before any conditional returns
  const [editMode, setEditMode] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  
  // Find the selected block - computed value, not a hook
  const block = blocks.find(b => b.id === selectedElementId)
  
  // Update state when selected block changes
  useEffect(() => {
    if (block) {
      setTitle(block.title || '')
      setDescription(block.description || '')
      setEditMode(false)
    }
  }, [block])
  
  // Get incoming and outgoing connections for node
  const getIncomingConnections = () => {
    if (!block) return [];
    return edges.filter(e => e.target === block.id);
  }
  
  const getOutgoingConnections = () => {
    if (!block) return [];
    return edges.filter(e => e.source === block.id);
  }
  
  // Save changes to the block
  const saveChanges = () => {
    if (!block) return;
    updateBlock(block.id, {
      title,
      description
    })
      
    // Update local state
    setEditMode(false)
      
    // Save to database
    saveForm()
  }
  
  // Cancel editing and reset values
  const cancelEdit = () => {
    if (!block) return;
    setTitle(block.title || '')
    setDescription(block.description || '')
    setEditMode(false)
  }
  
  // If no block is selected, show a message
  if (!block) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-muted-foreground">
        No block selected
      </div>
    )
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
                  {block.title || 'Untitled'}
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
                {block.blockTypeId?.replace('_', ' ') || 'Unknown'}
              </div>
            </div>
            
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">DESCRIPTION</Label>
              {!editMode ? (
                <div className="text-sm bg-muted py-2 px-3 rounded-md min-h-[36px]">
                  {block.description || <span className="text-muted-foreground italic">No description</span>}
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