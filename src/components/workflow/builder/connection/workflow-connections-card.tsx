"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useEdges, Edge } from 'reactflow'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { v4 as uuidv4 } from 'uuid'
import { Connection } from '@/types/workflow-types'
import { BlockPill } from '@/components/form/builder/block-pill'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WorkflowConnectionsCardProps {
  blockId: string;
}

export default function WorkflowConnectionsCard({ blockId }: WorkflowConnectionsCardProps) {
  // State and hooks
  const blocks = useFormBuilderStore(state => state.blocks)
  // const connections = useFormBuilderStore(state => state.connections) // Not currently used
  const saveForm = useFormBuilderStore(state => state.saveForm)
  const addConnection = useFormBuilderStore(state => state.addConnection)
  const edges = useEdges()
  
  // State for creating new connections
  const [creatingConnection, setCreatingConnection] = useState(false)
  const [targetBlockId, setTargetBlockId] = useState('')
  
  // Find the selected block
  const block = blocks.find(b => b.id === blockId)
  
  // Helper functions to get connections
  const getIncomingConnections = () => {
    if (!block) return [];
    return edges.filter(e => e.target === block.id);
  }
  
  const getOutgoingConnections = () => {
    if (!block) return [];
    return edges.filter(e => e.source === block.id);
  }
  
  if (!block) return null;

  return (
    <Card className="bg-card text-card-foreground flex flex-col gap-0! py-0! rounded-xl border shadow-sm border-blue-100">
      <div className="flex flex-col bg-blue-50 border-b border-blue-100 py-3 px-4">
        <h3 className="text-sm font-medium">Workflow Connections</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Manage incoming and outgoing connections for this block
        </p>
      </div>
      <CardContent className="px-4 py-0">
        <div className="space-y-4">
          <div className="flex justify-between items-center pt-3">
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
          
          <div className="h-px w-full bg-border"></div>
          
          <div>
            <h4 className="mb-2 block text-xs font-medium">Incoming Connections</h4>
            <div className="space-y-2 max-h-24 overflow-auto">
              {getIncomingConnections().length > 0 ? (
                getIncomingConnections().map((e: Edge) => {
                  const sourceBlock = blocks.find(b => b.id === e.source);
                  return (
                    <div key={e.id} className="text-xs py-1.5 rounded-md flex items-center gap-2">
                      <BlockPill block={sourceBlock} compact />
                      <span className="text-muted-foreground">{sourceBlock?.title || 'Unknown Block'}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic px-2">No incoming connections</p>
              )}
            </div>
            
            <div className="h-px w-full bg-border my-3"></div>
            
            <div className="flex items-center justify-between mt-2 mb-3">
              <h4 className="block text-xs font-medium">Outgoing Connections</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => setCreatingConnection(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create New Connection
              </Button>
            </div>
            
            {creatingConnection && (
              <div className="mb-3 p-3 border border-dashed rounded-md bg-muted/30">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-primary">Select Target Block</label>
                  <Select 
                    value={targetBlockId} 
                    onValueChange={setTargetBlockId} 
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a target block..." />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks
                        .filter(b => b.id !== block.id) // Can't connect to self
                        .map(b => (
                          <SelectItem key={b.id} value={b.id}>
                            <BlockPill block={b} />
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => {
                        setCreatingConnection(false);
                        setTargetBlockId('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="h-6 text-xs"
                      disabled={!targetBlockId}
                      onClick={() => {
                        // Create a new connection
                        if (targetBlockId && block) {
                          // These IDs are not currently used in this function
                          // const newRuleId = uuidv4();
                          // const newConditionId = uuidv4();

                          const newConnection: Connection = {
                            id: uuidv4(),
                            sourceId: block.id,
                            defaultTargetId: targetBlockId, // Set as default target initially
                            rules: [],
                            is_explicit: false,
                            order_index: 0
                          };
                          
                          addConnection(newConnection);
                          saveForm();
                          
                          toast({
                            title: "Connection created",
                            description: "New connection has been added",
                            duration: 2000
                          });
                          
                          setCreatingConnection(false);
                          setTargetBlockId('');
                        }
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-24 overflow-auto">
              {getOutgoingConnections().length > 0 ? (
                getOutgoingConnections().map((e: Edge) => {
                  const targetBlock = blocks.find(b => b.id === e.target);
                  return (
                    <div key={e.id} className="text-xs py-1.5 rounded-md flex items-center gap-2">
                      <BlockPill block={targetBlock} compact />
                      <span className="text-muted-foreground">{targetBlock?.title || 'Unknown Block'}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic px-2">No outgoing connections</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
