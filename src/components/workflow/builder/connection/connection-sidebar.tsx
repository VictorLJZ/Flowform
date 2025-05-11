"use client"

import { useState } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from "motion/react"
import { Save, Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Rule } from '@/types/workflow-types'
import { SourceHeader } from './source-header'
import { DefaultTarget } from './default-target'
import { RuleList } from './rule-list'

/**
 * Main connection sidebar component that handles the editing of workflow connections
 * Replaces the previous workflow-connection-sidebar with a cleaner architecture
 */
interface ConnectionSidebarProps {
  blockId?: string; // Optional block ID if opened from a block
}

export default function ConnectionSidebar({ blockId }: ConnectionSidebarProps = {}) {
  // const blocks = useFormBuilderStore(state => state.blocks) // Not currently used
  const connections = useFormBuilderStore(state => state.connections)
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  const addConnection = useFormBuilderStore(state => state.addConnection)
  const saveForm = useFormBuilderStore(state => state.saveForm)
  
  const [hasPendingSave, setHasPendingSave] = useState(false)
  
  // Determine which connection to edit based on the props and selected element
  const connection = blockId 
    ? connections.find(conn => conn.sourceId === blockId) // Find connection for a block
    : connections.find(conn => conn.id === selectedElementId) // Normal case - editing selected connection
  
  // Get the source block - currently not directly used but keeping for context
  // const sourceBlock = connection 
  //   ? blocks.find(b => b.id === connection.sourceId)
  //   : blockId 
  //     ? blocks.find(b => b.id === blockId) 
  //     : null
  
  // Handle saving changes
  const handleSaveChanges = async () => {
    await saveForm()
    setHasPendingSave(false)
  }
  
  // Handle adding a new rule
  const handleAddRule = () => {
    if (!connection) return
    
    const newRuleId = uuidv4()
    // const newConditionId = uuidv4() // Not used since we're generating a new ID directly in the conditions array
    
    // Create a new rule with one empty condition
    const newRule: Rule = {
      id: newRuleId,
      target_block_id: '', 
      condition_group: {
        logical_operator: 'AND',
        conditions: [
          {
            id: uuidv4(),
            field: '',
            operator: 'equals',
            value: '',
            logical_operator: 'AND' // Default logical operator
          }
        ],
      }
    }
    
    // Add the new rule to the connection
    const updatedRules = connection.rules ? [...connection.rules, newRule] : [newRule]
    updateConnection(connection.id, { rules: updatedRules })
    setHasPendingSave(true)
  }
  
  // If a block was selected but no connection exists yet, show option to create one
  if (!connection && blockId) {
    return (
      <ScrollArea className="h-full bg-background-secondary">
        <div className="p-4 space-y-4">
          <Card className="overflow-hidden shadow-sm !py-0 !gap-0">
            <CardHeader className="bg-blue-50 text-blue-700 p-3 space-y-1">
              <CardTitle className="text-sm font-medium">Create Connection</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                This block doesn&apos;t have any outgoing connections yet. Create a connection to define where users should go after this block.
              </p>
              <Button 
                onClick={() => {
                  if (!blockId) return;
                  
                  // Create a new connection with the block as source
                  const newConnection = {
                    id: uuidv4(),
                    sourceId: blockId,
                    defaultTargetId: null,
                    rules: [],
                    is_explicit: false,
                    order_index: 0 // Default order_index for a new connection
                  };
                  
                  addConnection(newConnection);
                  setHasPendingSave(true);
                }}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }
  
  // If no connection and no block ID, show empty state
  if (!connection) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-muted-foreground">
        No connection selected
      </div>
    )
  }
  
  return (
    <ScrollArea className="h-full bg-background-secondary">
      <div className="p-4 space-y-4">
        {/* Source block information */}
        <Card className="overflow-hidden shadow-sm !py-0 !gap-0">
          <div className="flex items-center bg-background border-b py-2 px-3">
            <h3 className="text-sm font-medium">Connection Source</h3>
          </div>
          <CardContent className="p-3">
            <SourceHeader connectionId={connection.id} sourceId={connection.sourceId} />
          </CardContent>
        </Card>
        
        {/* Rules section - only shown when there are rules */}
        <AnimatePresence>
          {connection.rules && connection.rules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", overflow: "visible" }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="overflow-hidden shadow-sm !py-0 !gap-0">
                <div className="flex items-center justify-between bg-background border-b py-2 px-3">
                  <h3 className="text-sm font-medium">Conditional Rules</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddRule}
                    className="h-7 px-2"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Rule
                  </Button>
                </div>
                <CardContent className="p-3">
                  <RuleList 
                    connectionId={connection.id} 
                    rules={connection.rules || []} 
                    onPendingChange={() => setHasPendingSave(true)}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Default target section */}
        <Card className="overflow-hidden shadow-sm !py-0 !gap-0">
          <div className="flex items-center bg-background border-b py-2 px-3">
            <h3 className="text-sm font-medium">Default Target</h3>
          </div>
          <CardContent className="p-3 space-y-4">
            <DefaultTarget 
              connectionId={connection.id}
              sourceId={connection.sourceId}
              defaultTargetId={connection.defaultTargetId || ''}
              onPendingChange={() => setHasPendingSave(true)}
            />
            
            {/* Add rule button in default target section when no rules present */}
            {(!connection.rules || connection.rules.length === 0) && (
              <div className="pt-2 border-t border-border">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddRule}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Conditional Rule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Save button */}
        {hasPendingSave && (
          <Button onClick={handleSaveChanges} className="w-full mt-4">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        )}
      </div>
    </ScrollArea>
  )
}
