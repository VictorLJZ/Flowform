"use client"

import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { ConditionRule, ConditionOperator, LogicalOperator } from '@/types/workflow-types'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { BlockPill } from '@/components/form/builder/block-pill'
import { useMemo } from 'react'

interface ConditionItemProps {
  condition: ConditionRule;
  conditionIndex: number;
  connectionId: string;
  ruleId: string;
  isLast: boolean;
  onPendingChange: () => void;
}

/**
 * Component for displaying and editing a single condition
 */
export function ConditionItem({ 
  condition, 
  conditionIndex, 
  connectionId, 
  ruleId,
  // isLast, // Not currently used
  onPendingChange 
}: ConditionItemProps) {
  const blocks = useFormBuilderStore(state => state.blocks)
  const connections = useFormBuilderStore(state => state.connections)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  
  // Find the connection and source block
  const connection = connections.find(conn => conn.id === connectionId)
  // const sourceBlock = blocks.find(block => block.id === connection?.sourceId) // Not currently used
  // const sourceBlockType = sourceBlock?.blockTypeId || 'unknown' // Not currently used
  
  // Find the field block
  const fieldBlock = blocks.find(block => block.id === condition.field)
  
  // Extract choice options for multiple choice fields
  const choiceOptions = useMemo(() => {
    if (!fieldBlock) return []
    if (!fieldBlock.settings) return []
    
    // Multiple choice options can be in either choices or options property
    const options = fieldBlock.settings.choices || fieldBlock.settings.options
    
    if (!options || !Array.isArray(options)) return []
    
    return options.map(option => ({
      label: option.label || option.value || '',
      value: option.value || option.label || ''
    }))
  }, [fieldBlock])
  
  // Update a condition property (field, operator, value)
  const updateCondition = (key: string, value: string | ConditionOperator) => {
    if (!connection) return
    
    // Find the rule
    const rule = connection.rules?.find(r => r.id === ruleId)
    if (!rule) return
    
    // Update the condition
    const updatedRules = connection.rules?.map(r => {
      if (r.id === ruleId) {
        const updatedConditions = r.condition_group.conditions.map(c => {
          if (c.id === condition.id) {
            return { ...c, [key]: value }
          }
          return c
        })
        
        return {
          ...r,
          condition_group: {
            ...r.condition_group,
            conditions: updatedConditions
          }
        }
      }
      return r
    }) || []
    
    updateConnection(connectionId, { rules: updatedRules })
    onPendingChange()
  }
  
  // Handle removing the condition
  const handleRemoveCondition = () => {
    if (!connection) return
    
    // Find the rule
    const rule = connection.rules?.find(r => r.id === ruleId)
    if (!rule) return
    
    // Remove the condition
    const updatedRules = connection.rules?.map(r => {
      if (r.id === ruleId) {
        const updatedConditions = r.condition_group.conditions.filter(
          c => c.id !== condition.id
        )
        
        return {
          ...r,
          condition_group: {
            ...r.condition_group,
            conditions: updatedConditions
          }
        }
      }
      return r
    }) || []
    
    updateConnection(connectionId, { rules: updatedRules })
    onPendingChange()
  }
  
  // Get available operators based on field type
  const operators = useMemo(() => {
    // Default operators for most field types
    const defaultOperators = [
      { value: 'equals', label: 'equals' },
      { value: 'not_equals', label: 'does not equal' }
    ]
    
    // Check the selected field's block type, not the source block
    const fieldBlockType = fieldBlock?.blockTypeId || ''
    
    // Debug log to see what field types are being detected
    console.log('Field ID:', condition.field, 'Field Block Type:', fieldBlockType, 'Field Block:', fieldBlock)
    
    // Special case for multiple choice and checkbox fields
    if (fieldBlockType === 'multiple_choice' || fieldBlockType === 'checkbox_group' || 
        fieldBlockType === 'dropdown' || fieldBlockType === 'rating') {
      return [
        { value: 'equals', label: 'is' },
        { value: 'not_equals', label: 'is not' }
      ]
    }
    
    if (fieldBlockType === 'number') {
      return [
        ...defaultOperators,
        { value: 'greater_than', label: 'is greater than' },
        { value: 'less_than', label: 'is less than' }
      ]
    }
    
    if (fieldBlockType === 'date') {
      return [
        ...defaultOperators,
        { value: 'before', label: 'is before' },
        { value: 'after', label: 'is after' }
      ]
    }
    
    // Match any text-like field types more broadly
    if (['short_text', 'long_text', 'email', 'phone', 'text', 'textarea', 'paragraph', 'input'].some(type => fieldBlockType.includes(type))) {
      return [
        ...defaultOperators,
        { value: 'contains', label: 'contains' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' }
      ]
    }
    
    return defaultOperators
  }, [fieldBlock, condition.field])
  
  // This logical operator label was previously used but is now handled directly in the JSX
  // const logicalLabel = conditionIndex === 0 
  //   ? 'If' 
  //   : condition.logical_operator === 'AND' ? 'AND' : 'OR'
  
  return (
    <div className="bg-background rounded-md p-3 relative border border-border-secondary">
      {/* Condition controls */}
      <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
        {/* Logical operator label and toggle if not first condition */}
        {conditionIndex === 0 ? (
          <span className="text-sm font-medium text-primary-foreground bg-primary rounded-sm px-2 py-1">
            If
          </span>
        ) : (
          <Select
            value={condition.logical_operator || 'AND'}
            onValueChange={(value) => updateCondition('logical_operator', value as LogicalOperator)}
          >
            <SelectTrigger className="w-20 font-medium border-2">
              <SelectValue placeholder="AND" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND" className="font-medium">AND</SelectItem>
              <SelectItem value="OR" className="font-medium">OR</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {/* Field selector */}
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <Select
            value={condition.field || ''}
            onValueChange={(value) => updateCondition('field', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field...">
                {fieldBlock ? (
                  <BlockPill block={fieldBlock} />
                ) : (
                  "Select field..."
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {blocks.map((block) => (
                <SelectItem key={block.id} value={block.id} className="flex items-center">
                  <BlockPill block={block} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Remove condition button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemoveCondition}
          >
            <Trash2 size={14} />
          </Button>
        </div>
        
        {/* Spacing for operator alignment */}
        <div></div>
        
        {/* Operator selector */}
        <Select
          value={condition.operator || 'equals'}
          onValueChange={(value) => updateCondition('operator', value as ConditionOperator)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select operator..." />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Spacing for value alignment */}
        <div></div>
        
        {/* Value input changes based on field type */}
        {fieldBlock?.blockTypeId === 'multiple_choice' || fieldBlock?.blockTypeId === 'dropdown' || 
          fieldBlock?.blockTypeId === 'checkbox_group' || fieldBlock?.blockTypeId === 'rating' ? (
          // For multiple choice fields, show a select with the question's choices
          <Select
            value={condition.value ? condition.value.toString() : ''}
            onValueChange={(value) => updateCondition('value', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {choiceOptions.length > 0 ? (
                choiceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_options_available">No options available</SelectItem>
              )}
            </SelectContent>
          </Select>
        ) : fieldBlock?.blockTypeId === 'number' ? (
          // For number fields, use a number input
          <Input
            type="number"
            placeholder="Enter number..."
            value={condition.value ? condition.value.toString() : ''}
            onChange={(e) => updateCondition('value', e.target.value)}
            className="w-full"
          />
        ) : fieldBlock?.blockTypeId === 'date' ? (
          // For date fields, use a date input
          <Input
            type="date"
            placeholder="Select date..."
            value={condition.value ? condition.value.toString() : ''}
            onChange={(e) => updateCondition('value', e.target.value)}
            className="w-full"
          />
        ) : (
          // Default text input for all other types
          <Input
            placeholder="Enter value..."
            value={condition.value ? condition.value.toString() : ''}
            onChange={(e) => updateCondition('value', e.target.value)}
            className="w-full"
          />
        )}
      </div>
    </div>
  )
}
