"use client"

import { useEffect, useState, useCallback } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Edge } from 'reactflow'
import { WorkflowEdgeData, Connection, ConditionRule } from '@/types/workflow-types'
import { ConnectionOverview } from './connection-overview'
import { ConditionCard } from './condition-card'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface WorkflowConnectionSidebarProps {
  element: Edge<WorkflowEdgeData>;
  onHasChanges: (hasChanges: boolean) => void;
}

export default function WorkflowConnectionSidebar({ element, onHasChanges }: WorkflowConnectionSidebarProps) {
  const blocks = useFormBuilderStore(state => state.blocks)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  const saveForm = useFormBuilderStore(state => state.saveForm)
  
  // Local state to track the current connection being edited
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Detect block types to show appropriate condition options
  const sourceBlock = blocks.find(b => b.id === element.source)
  const targetBlock = blocks.find(b => b.id === element.target)
  const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
  
  // Initialize editing state when element changes
  useEffect(() => {
    if (element?.data?.connection) {
      // Deep clone the connection to avoid reference issues
      const connectionCopy = JSON.parse(JSON.stringify(element.data.connection)) as Connection
      setEditingConnection(connectionCopy)
      setHasChanges(false)
    }
  }, [element.id])
  
  // Handle condition changes - update UI immediately
  const handleConditionChange = useCallback((key: string, value: string | number | boolean) => {
    if (!editingConnection) return
    
    setEditingConnection(prev => {
      if (!prev) return null
      
      // Create a new condition object if it doesn't exist yet
      const updatedCondition: ConditionRule = prev.condition || {
        field: '',
        operator: 'equals',
        value: ''
      }
      
      // Update the specified key
      const newCondition = {
        ...updatedCondition,
        [key]: value
      }
      
      // Special case: When field changes, reset operator to equals
      if (key === 'field' && updatedCondition.field !== value) {
        newCondition.operator = 'equals'
        
        // Also reset value when field changes to avoid type mismatches
        if (typeof value === 'string' && value.startsWith('choice:')) {
          newCondition.value = true
        } else if (value === 'rating' || (value === 'answer' && sourceBlockType === 'number')) {
          newCondition.value = 0
        } else if (value === 'selected') {
          newCondition.value = true
        } else {
          newCondition.value = ''
        }
      }
      
      // Return updated connection with new condition
      return {
        ...prev,
        condition: newCondition
      }
    })
    
    // Immediately update the connection in the store for UI display
    // This provides instant visual feedback without saving to the database
    if (editingConnection) {
      const connectionCopy = { ...editingConnection };
      if (!connectionCopy.condition) {
        connectionCopy.condition = { field: '', operator: 'equals', value: '' };
      }
      
      connectionCopy.condition[key as keyof ConditionRule] = value;
      
      // Update the connection in the store (only for display, not saved to DB yet)
      updateConnection(element.id, {
        condition: connectionCopy.condition
      });
      
      // Mark that we have unsaved changes
      setHasChanges(true);
    }
  }, [editingConnection, sourceBlockType, element.id, updateConnection]);
  
  // Apply changes manually
  const handleApplyChanges = useCallback(() => {
    if (editingConnection && hasChanges) {
      try {
        console.log(`Applying condition changes for connection ${element.id}`);
        
        // Update the connection in the store
        updateConnection(element.id, {
          condition: editingConnection.condition
        });
        
        // Show saving indicator
        onHasChanges(true);
        
        // Save the form to persist changes to database
        saveForm();
        
        // Reset changes flag
        setHasChanges(false);
        
        // Clear notification after a short delay
        setTimeout(() => {
          onHasChanges(false);
        }, 1000);
      } catch (error) {
        console.error('Error updating connection condition:', error);
        onHasChanges(false);
      }
    }
  }, [editingConnection, hasChanges, element.id, updateConnection, onHasChanges, saveForm]);
  
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-5">
        {/* Connection overview */}
        <ConnectionOverview 
          element={element}
          sourceBlock={sourceBlock}
          targetBlock={targetBlock}
          sourceBlockType={sourceBlockType}
          currentConnection={editingConnection}
        />

        {/* Condition configuration */}
        <ConditionCard
          element={element}
          sourceBlock={sourceBlock}
          sourceBlockType={sourceBlockType}
          onConditionChange={handleConditionChange}
          currentConnection={editingConnection}
        />
        
        {/* Apply changes button */}
        {hasChanges && (
          <div className="py-2">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full gap-2" 
              onClick={handleApplyChanges}
            >
              <Save size={16} />
              Apply Changes
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
} 