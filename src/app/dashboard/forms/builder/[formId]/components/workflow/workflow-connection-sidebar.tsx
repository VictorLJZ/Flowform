"use client"

import { useEffect } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Edge } from 'reactflow'
import { WorkflowEdgeData } from '@/types/workflow-types'
import { ConnectionOverview } from './connection-overview'
import { ConditionCard } from './condition-card'

interface WorkflowConnectionSidebarProps {
  element: Edge<WorkflowEdgeData>;
  onHasChanges: (hasChanges: boolean) => void;
}

export default function WorkflowConnectionSidebar({ element, onHasChanges }: WorkflowConnectionSidebarProps) {
  const blocks = useFormBuilderStore(state => state.blocks)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  const saveForm = useFormBuilderStore(state => state.saveForm)
  
  // Detect block types to show appropriate condition options
  const sourceBlock = blocks.find(b => b.id === element.source)
  const targetBlock = blocks.find(b => b.id === element.target)
  const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
  
  // Autosave after connection updates (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (element?.data?.connection?.condition) {
        console.log("Auto-saving connection condition");
        saveForm();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [element?.data?.connection?.condition, saveForm]);
  
  // Handle condition changes
  const handleConditionChange = (key: string, value: string | number | boolean) => {
    if (element?.data?.connection) {
      const currentCondition = element.data.connection.condition || { 
        field: '', operator: 'equals' as const, value: '' 
      };
      
      // Special handling depending on the field type
      if (key === 'field') {
        const newField = value.toString();
        
        // For choice-specific options, auto-set value to true (is selected)
        if (newField.startsWith('choice:')) {
          updateConnection(element.id, {
            condition: {
              field: newField,
              operator: 'equals',
              value: true
            }
          });
          onHasChanges(true);
          return;
        }
        
        // For selected field in checkbox groups, set value to true
        if (newField === 'selected' && sourceBlockType === 'checkbox_group') {
          updateConnection(element.id, {
            condition: {
              field: newField,
              operator: currentCondition.operator,
              value: true
            }
          });
          onHasChanges(true);
          return;
        }
        
        // For dropdown/multiple choice field, ensure we have a blank value to force selection
        if (newField === 'answer' && (sourceBlockType === 'multiple_choice' || sourceBlockType === 'dropdown')) {
          updateConnection(element.id, {
            condition: {
              field: newField,
              operator: currentCondition.operator,
              value: ''
            }
          });
          onHasChanges(true);
          return;
        }
        
        // For number field, ensure we have a numeric value
        if ((newField === 'answer' && sourceBlockType === 'number') || 
            newField === 'rating' || 
            newField === 'length') {
          updateConnection(element.id, {
            condition: {
              field: newField,
              operator: currentCondition.operator,
              value: 0
            }
          });
          onHasChanges(true);
          return;
        }
      }
      
      // Default case - just update the specified key
      updateConnection(element.id, {
        condition: {
          ...currentCondition,
          [key]: value
        }
      });
      
      onHasChanges(true);
    }
  }
  
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-5">
        {/* Connection overview */}
        <ConnectionOverview 
          element={element}
          sourceBlock={sourceBlock}
          targetBlock={targetBlock}
          sourceBlockType={sourceBlockType}
        />

        {/* Condition configuration */}
        <ConditionCard
          element={element}
          sourceBlock={sourceBlock}
          sourceBlockType={sourceBlockType}
          onConditionChange={handleConditionChange}
        />
      </div>
    </ScrollArea>
  )
} 