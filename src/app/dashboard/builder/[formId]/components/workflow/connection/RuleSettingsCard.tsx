"use client"

// import { useState } from 'react' // Not currently used
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormBlock } from '@/types/block-types'
import { Connection, ConditionGroup, ConditionRule, Rule } from '@/types/workflow-types'
import { BlockPill } from '../../block-pill'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, PlusCircle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
// import { getBlockTypeColors } from '@/utils/block-utils' // Not currently used

interface RuleSettingsCardProps {
  connection: Connection;
  blocks: FormBlock[];
  onRuleChange: (updatedRules: Rule[]) => void;
  onPendingChange: () => void;
}

export function RuleSettingsCard({ connection, blocks, onRuleChange, onPendingChange }: RuleSettingsCardProps) {
  const sourceBlock = blocks.find(b => b.id === connection.sourceId);
  const sourceBlockType = sourceBlock?.blockTypeId || 'unknown';
  // Using static class names instead of dynamic color scheme to avoid TypeScript errors
  
  // Add a new rule to the connection
  const handleAddRule = () => {
    const newCondition: ConditionRule = {
      id: uuidv4(),
      field: '',
      operator: 'equals',
      value: ''
    };
    
    const newConditionGroup: ConditionGroup = {
      logical_operator: 'AND',
      conditions: [newCondition]
    };
    
    const newRule: Rule = {
      id: uuidv4(),
      target_block_id: '', // Empty initially
      condition_group: newConditionGroup
    };
    
    const updatedRules = [...(connection.rules || []), newRule];
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  // Add a condition to a rule
  const handleAddCondition = (ruleId: string) => {
    if (!connection.rules) return;
    
    const rule = connection.rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const newCondition: ConditionRule = {
      id: uuidv4(),
      field: '',
      operator: 'equals',
      value: '',
      logical_operator: 'AND'
    };
    
    const updatedRules = connection.rules.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          condition_group: {
            ...r.condition_group,
            conditions: [...r.condition_group.conditions, newCondition]
          }
        };
      }
      return r;
    });
    
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  // Remove a condition from a rule
  const handleRemoveCondition = (ruleId: string, conditionId: string) => {
    if (!connection.rules) return;
    
    const updatedRules = connection.rules.map(r => {
      if (r.id === ruleId) {
        const updatedConditions = r.condition_group.conditions.filter(c => c.id !== conditionId);
        return {
          ...r,
          condition_group: {
            ...r.condition_group,
            conditions: updatedConditions
          }
        };
      }
      return r;
    });
    
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  // Update rule target
  const handleRuleTargetChange = (ruleId: string, targetId: string) => {
    if (!connection.rules) return;
    
    const updatedRules = connection.rules.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          target_block_id: targetId
        };
      }
      return r;
    });
    
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  // Update a condition field
  const handleConditionFieldChange = (ruleId: string, conditionId: string, field: string) => {
    if (!connection.rules) return;
    
    const updatedRules = connection.rules.map(r => {
      if (r.id === ruleId) {
        const updatedConditions = r.condition_group.conditions.map(c => {
          if (c.id === conditionId) {
            const updatedCondition = { ...c, field };
            
            // Reset value based on field type
            if (c.field !== field) {
              updatedCondition.operator = 'equals';
              if (field.startsWith('choice:')) {
                updatedCondition.value = true;
              } else if (field === 'rating' || (field === 'answer' && sourceBlockType === 'number')) {
                updatedCondition.value = 0;
              } else if (field === 'selected') {
                updatedCondition.value = true;
              } else {
                updatedCondition.value = '';
              }
            }
            
            return updatedCondition;
          }
          return c;
        });
        
        return {
          ...r,
          condition_group: {
            ...r.condition_group,
            conditions: updatedConditions
          }
        };
      }
      return r;
    });
    
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  // Update condition operator
  const handleConditionOperatorChange = (ruleId: string, conditionId: string, operator: string) => {
    if (!connection.rules) return;
    
    const updatedRules = connection.rules.map(r => {
      if (r.id === ruleId) {
        const updatedConditions = r.condition_group.conditions.map(c => {
          if (c.id === conditionId) {
            return { ...c, operator: operator as ConditionRule['operator'] };
          }
          return c;
        });
        
        return {
          ...r,
          condition_group: {
            ...r.condition_group,
            conditions: updatedConditions
          }
        };
      }
      return r;
    });
    
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  // Update condition value
  const handleConditionValueChange = (ruleId: string, conditionId: string, value: string) => {
    if (!connection.rules) return;
    
    const updatedRules = connection.rules.map(r => {
      if (r.id === ruleId) {
        const updatedConditions = r.condition_group.conditions.map(c => {
          if (c.id === conditionId) {
            return { ...c, value };
          }
          return c;
        });
        
        return {
          ...r,
          condition_group: {
            ...r.condition_group,
            conditions: updatedConditions
          }
        };
      }
      return r;
    });
    
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  // Remove a rule
  const handleRemoveRule = (ruleId: string) => {
    if (!connection.rules) return;
    
    const updatedRules = connection.rules.filter(r => r.id !== ruleId);
    onRuleChange(updatedRules);
    onPendingChange();
  };
  
  return (
    <Card className="bg-card text-card-foreground flex flex-col !gap-0 !py-0 rounded-xl border shadow-sm">
      <CardHeader className={`bg-amber-50 text-amber-800 p-3 space-y-0`}>
        <CardTitle className="text-sm font-medium flex flex-row items-center justify-between">
          <span>Conditional Rules</span>
          {(connection.rules?.length ?? 0) > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={handleAddRule}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Rule
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-xs text-amber-700/80">
          Create rules to determine the flow based on answers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-3 space-y-3">
        {!connection.rules || connection.rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-sm text-muted-foreground mb-3">No rules have been created yet</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddRule}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {connection.rules.map((rule, ruleIndex) => (
              <div key={rule.id} className="border rounded-md p-3 border-amber-200 bg-amber-50/40">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Rule {ruleIndex + 1}</h4>
                  <Button 
                    variant="outline"
                    size="icon" 
                    className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive h-6 w-6"
                    onClick={() => handleRemoveRule(rule.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* IF Clauses: Condition List */}
                {rule.condition_group && rule.condition_group.conditions && rule.condition_group.conditions.map((condition, condIndex) => (
                  <div key={condition.id} className="space-y-1 p-2 border border-dashed border-border-secondary rounded-md mt-2 overflow-hidden">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {condIndex === 0 ? 'If' : 'And if'}
                      </span>
                      <Select
                        value={condition.field || ''} 
                        onValueChange={(newFieldId) => handleConditionFieldChange(rule.id, condition.id, newFieldId)}
                      >
                        <SelectTrigger id={`rule-${rule.id}-cond-${condition.id}-field-select`} className="flex-grow">
                          <SelectValue placeholder="Select source question...">
                            {blocks.find(b => b.id === condition.field) ? (
                              <BlockPill block={blocks.find(b => b.id === condition.field)} />
                            ) : (
                              "Select source question..."
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {blocks
                            .map(block => (
                              <SelectItem key={block.id} value={block.id} className="flex items-center">
                                <BlockPill block={block} />
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator || ''}
                        onValueChange={(newOperator) => handleConditionOperatorChange(rule.id, condition.id, newOperator)}
                      >
                        <SelectTrigger id={`rule-${rule.id}-cond-${condition.id}-operator-select`} className="w-[150px]">
                          <SelectValue placeholder="Operator..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not_equals">not equals</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="greater_than">greater than</SelectItem>
                          <SelectItem value="less_than">less than</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        id={`rule-${rule.id}-cond-${condition.id}-value-input`}
                        type="text"
                        placeholder="Value..."
                        value={String(condition.value) || ''}
                        onChange={(e) => handleConditionValueChange(rule.id, condition.id, e.target.value)}
                        className="flex-grow"
                      />
                      
                      {rule.condition_group.conditions.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveCondition(rule.id, condition.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add condition button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full border-dashed"
                  onClick={() => handleAddCondition(rule.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
                
                {/* THEN part: Target selection */}
                <div className="mt-4 pt-3 border-t border-amber-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm">THEN</span>
                    <span className="text-sm text-muted-foreground">go to:</span>
                    <Select
                      value={rule.target_block_id || ''}
                      onValueChange={(newTargetId) => handleRuleTargetChange(rule.id, newTargetId)}
                    >
                      <SelectTrigger id={`rule-${rule.id}-target-select`} className="flex-grow">
                        <SelectValue placeholder="Select target block...">
                          {blocks.find(b => b.id === rule.target_block_id) ? (
                            <BlockPill block={blocks.find(b => b.id === rule.target_block_id)} />
                          ) : (
                            "Select target block..."
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {blocks
                          .filter(b => b.id !== connection.sourceId) // Can't target self
                          .map(block => (
                            <SelectItem key={block.id} value={block.id} className="flex items-center">
                              <BlockPill block={block} />
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add rule button for empty state */}
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
  );
}
