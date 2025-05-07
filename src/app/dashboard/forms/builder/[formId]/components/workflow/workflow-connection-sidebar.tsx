"use client"

import { useState, useCallback } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Edge } from 'reactflow'
import { WorkflowEdgeData, ConditionRule, Connection } from '@/types/workflow-types'
import { ConnectionOverview } from './connection-overview'
import { ConditionCard } from './condition-card'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function WorkflowConnectionSidebar() {
  // Place ALL hooks at the top level of the component to comply with React rules
  const blocks = useFormBuilderStore(state => state.blocks)
  const connections = useFormBuilderStore(state => state.connections)
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  const saveForm = useFormBuilderStore(state => state.saveForm)
  
  // Track when we need to save to the database
  const [hasPendingSave, setHasPendingSave] = useState(false)
  
  // Find the selected connection - computed value, not a hook
  const connection = connections.find(conn => conn.id === selectedElementId)
  
  // Find source and target blocks - computed values, not hooks
  const sourceBlock = connection ? blocks.find(b => b.id === connection.sourceId) : null
  const targetBlock = connection ? blocks.find(b => b.id === connection.targetId) : null
  const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
  
  // Create a pseudo-Edge object for compatibility with existing components
  const element = connection ? {
    id: connection.id,
    source: connection.sourceId,
    target: connection.targetId,
    data: { connection },
    type: 'workflow'
  } as Edge<WorkflowEdgeData> : null
  
  // Handle condition type changes (always, conditional, fallback)
  const handleConditionTypeChange = useCallback((conditionType: 'always' | 'conditional' | 'fallback') => {
    // Don't proceed if no connection is selected
    if (!connection) return;
    
    // Update the connection with the new condition type
    const connectionUpdate: Partial<Connection> = {
      conditionType
    }
    
    // If switching to conditional, ensure we have at least one condition with an ID
    if (conditionType === 'conditional') {
      // Create a new default condition with a unique ID
      const newCondition: ConditionRule = {
        id: uuidv4(),
        field: '',
        operator: 'equals',
        value: ''
      }
      
      // Set as array of conditions
      connectionUpdate.conditions = [newCondition]
    } else {
      // For 'always' or 'fallback', set empty conditions array
      connectionUpdate.conditions = []
    }
    
    // Update connection in store
    updateConnection(connection.id, connectionUpdate)
    setHasPendingSave(true)
  }, [connection, updateConnection])
  
  // Handle changes to a specific condition within a connection
  const handleConditionChange = useCallback((key: string, value: string | number | boolean, conditionId?: string) => {
    // Don't proceed if no connection is selected
    if (!connection) return;
    
    if (!conditionId || !connection.conditions) {
      console.error('Missing conditionId or conditions array')
      return
    }
    
    // Update an existing condition in the conditions array
    const conditions = [...(connection.conditions || [])]
    const conditionIndex = conditions.findIndex(cond => cond.id === conditionId)
    
    if (conditionIndex >= 0) {
      // Create updated condition object
      const updatedCondition = {
        ...conditions[conditionIndex],
        [key]: value
      }
      
      // Special case: When field changes, reset operator to equals
      if (key === 'field' && conditions[conditionIndex].field !== value) {
        updatedCondition.operator = 'equals'
        
        // Also reset value when field changes to avoid type mismatches
        if (typeof value === 'string' && value.startsWith('choice:')) {
          updatedCondition.value = true
        } else if (value === 'rating' || (value === 'answer' && sourceBlockType === 'number')) {
          updatedCondition.value = 0
        } else if (value === 'selected') {
          updatedCondition.value = true
        } else {
          updatedCondition.value = ''
        }
      }
      
      // Update the condition in the array
      conditions[conditionIndex] = updatedCondition
      
      // Update the connection in the store
      updateConnection(connection.id, {
        conditions
      })
      
      // Set flag to indicate we need to save to database
      setHasPendingSave(true)
    }
  }, [connection, sourceBlockType, updateConnection])
  
  // Add a new condition to the connection
  const handleAddCondition = useCallback(() => {
    // Don't proceed if no connection is selected
    if (!connection) return;
    
    // Create a new default condition with a unique ID
    const newCondition: ConditionRule = {
      id: uuidv4(),
      field: '',
      operator: 'equals',
      value: ''
    }
    
    // Add to conditions array, ensuring we're in conditional mode
    const currentConditions = [...(connection.conditions || [])]
    currentConditions.push(newCondition)
    
    // Update the connection
    updateConnection(connection.id, {
      conditionType: 'conditional',
      conditions: currentConditions
    })
    
    setHasPendingSave(true)
  }, [connection, updateConnection])
  
  // Remove a condition from the connection
  const handleRemoveCondition = useCallback((conditionId: string) => {
    // Don't proceed if no connection is selected
    if (!connection) return;
    
    // Get current conditions
    const currentConditions = [...(connection.conditions || [])]
    
    // Filter out the condition to remove
    const updatedConditions = currentConditions.filter(cond => cond.id !== conditionId)
    
    // If removing the last condition, set type to 'always'
    const conditionType = updatedConditions.length > 0 ? 'conditional' : 'always'
    
    // Update the connection
    updateConnection(connection.id, {
      conditionType,
      conditions: updatedConditions
    })
    
    setHasPendingSave(true)
  }, [connection, updateConnection])
  
  // Save changes to the database
  const handleSaveChanges = useCallback(() => {
    // Don't proceed if no connection is selected
    if (!connection || !hasPendingSave) return;
    
    try {
      console.log(`Saving connection ${connection.id} to database`)
      
      // Save the form to persist changes to database
      saveForm()
      
      // Reset the pending save flag
      setHasPendingSave(false)
    } catch (error) {
      console.error('Error saving connection:', error)
    }
  }, [connection, hasPendingSave, saveForm])
  
  // Create a wrapper function to adapt our parameter order to what ConditionCard expects
  const adaptedConditionChangeHandler = useCallback((conditionId: string, key: string, value: string | number | boolean) => {
    handleConditionChange(key, value, conditionId)
  }, [handleConditionChange])
  
  // If no connection is selected, show a message
  if (!connection || !element) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-muted-foreground">
        No connection selected
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full overflow-hidden workflow-connection-sidebar">
      {/* Main scrollable content area */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4 space-y-5">
          {/* Connection overview */}
          <ConnectionOverview 
            element={element}
            sourceBlock={sourceBlock}
            targetBlock={targetBlock}
            sourceBlockType={sourceBlockType}
            currentConnection={connection}
          />

          {/* Condition configuration */}
          <ConditionCard
            element={element}
            sourceBlock={sourceBlock}
            sourceBlockType={sourceBlockType}
            currentConnection={connection}
            onConditionChange={adaptedConditionChangeHandler}
            onConditionTypeChange={handleConditionTypeChange}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
          />
        </div>
      </ScrollArea>
      
      {/* Fixed footer with save button - always visible */}
      <div className="border-t bg-background p-3 flex justify-end shrink-0">
        <Button 
          onClick={handleSaveChanges} 
          disabled={!hasPendingSave} 
          className={!hasPendingSave ? 'opacity-50' : ''}
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
