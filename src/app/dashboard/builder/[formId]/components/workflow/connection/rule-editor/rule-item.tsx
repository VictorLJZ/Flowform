"use client"

import { useState } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { Rule, ConditionOperator, ConditionRule } from '@/types/workflow-types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react'
import { BlockPill } from '../../../block-pill'
import { ConditionItem } from './condition-item'
import { v4 as uuidv4 } from 'uuid'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface RuleItemProps {
  rule: Rule;
  ruleIndex: number;
  connectionId: string;
  onPendingChange: () => void;
}

/**
 * Component for a single rule with its target and conditions
 */
export function RuleItem({ rule, ruleIndex, connectionId, onPendingChange }: RuleItemProps) {
  const [expanded, setExpanded] = useState(true)
  const blocks = useFormBuilderStore(state => state.blocks)
  const connections = useFormBuilderStore(state => state.connections)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  
  // Find the connection
  const connection = connections.find(conn => conn.id === connectionId)
  
  // Find the source block to exclude from target options
  const sourceId = connection?.sourceId || ''
  
  // Available blocks for target (excluding source)
  const availableBlocks = blocks.filter(block => block.id !== sourceId)
  
  // Find the target block
  const targetBlock = blocks.find(block => block.id === rule.target_block_id)
  
  // Handle changing the target block
  const handleTargetChange = (newTargetId: string) => {
    if (!connection) return
    
    // Update the rule's target
    const updatedRules = connection.rules?.map(r => 
      r.id === rule.id 
        ? { ...r, target_block_id: newTargetId }
        : r
    ) || []
    
    updateConnection(connectionId, { rules: updatedRules })
    onPendingChange()
  }
  
  // Handle removing the rule
  const handleRemoveRule = () => {
    if (!connection) return
    
    // Filter out this rule
    const updatedRules = connection.rules?.filter(r => r.id !== rule.id) || []
    updateConnection(connectionId, { rules: updatedRules })
    onPendingChange()
  }
  
  // Handle adding a new condition
  const handleAddCondition = () => {
    if (!connection) return
    
    // Create a new condition
    const newConditionId = uuidv4()
    const newCondition: ConditionRule = {
      id: newConditionId,
      field: '',
      operator: 'equals' as ConditionOperator,
      value: '',
      logical_operator: 'AND' // Default logical operator
    }
    
    // Add the condition to this rule
    const updatedRules = connection.rules?.map(r => {
      if (r.id === rule.id) {
        const updatedConditions = [
          ...(r.condition_group?.conditions || []),
          newCondition
        ]
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
  
  // No longer needed as we're using per-condition logical operators
  
  // Get the conditions for this rule
  const conditions = rule.condition_group?.conditions || []
  // const logicalOperator = rule.condition_group?.logical_operator || 'AND' // No longer needed as we're using per-condition logical operators
  
  return (
    <div className="border border-border-secondary rounded-md overflow-hidden bg-background">
      {/* Rule header */}
      <div className="bg-muted p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
          <span className="text-sm font-medium">Rule {ruleIndex + 1}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleRemoveRule}
        >
          <Trash2 size={14} className="mr-1" />
          Remove
        </Button>
      </div>
      
      {/* Rule content (when expanded) */}
      {expanded && (
        <div className="p-3 space-y-4">
          {/* Conditions section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Conditions</span>
            </div>
            
            {conditions.length > 0 ? (
              <div className="space-y-2 pl-3 border-l-2 border-slate-200">
                {conditions.map((condition, index) => (
                  <ConditionItem 
                    key={condition.id}
                    condition={condition}
                    conditionIndex={index}
                    connectionId={connectionId}
                    ruleId={rule.id}
                    isLast={index === conditions.length - 1}
                    onPendingChange={onPendingChange}
                  />
                ))}
              </div>
            ) : (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 py-2 px-3">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs">
                  This rule has no conditions yet. Add at least one condition below.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Add condition button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddCondition}
              className="mt-3 w-full border-dashed"
            >
              <Plus size={14} className="mr-1" />
              Add Condition
            </Button>
          </div>
          
          {/* Target block selector with THEN label */}
          <div className="space-y-2 border-t border-border pt-3 mt-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-foreground bg-blue-500 rounded-sm px-2 py-1">
                THEN
              </span>
              <span className="text-sm text-muted-foreground">go to:</span>
            </div>
            <Select
              value={rule.target_block_id || ''}
              onValueChange={handleTargetChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target block...">
                  {targetBlock ? (
                    <BlockPill block={targetBlock} />
                  ) : (
                    "Select target block..."
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableBlocks.map(block => (
                  <SelectItem key={block.id} value={block.id} className="flex items-center">
                    <BlockPill block={block} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
