"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Edge } from 'reactflow'
import { WorkflowEdgeData, ConditionRule, Rule, ConditionGroup } from '@/types/workflow-types'
import { ConditionCard } from './condition-card' // ConditionCard will be refactored next
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, XCircle } from 'lucide-react';
import { BlockPill } from '@/components/form/builder/block-pill';

export default function WorkflowConnectionSidebar() {
  const blocks = useFormBuilderStore(state => state.blocks)
  const connections = useFormBuilderStore(state => state.connections)
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  const updateConnectionTarget = useFormBuilderStore(state => state.updateConnectionTarget);
  const saveForm = useFormBuilderStore(state => state.saveForm)
  
  const [hasPendingSave, setHasPendingSave] = useState(false)
  const [saveFormTimer] = useState<NodeJS.Timeout | null>(null);
  useState(false)
  useState<Rule | null | undefined>(null)

  const sourceBlock = useMemo(() => {
    if (selectedElementId && blocks.find(b => b.id === selectedElementId)) {
      return blocks.find(b => b.id === selectedElementId)
    }
    // If selected element is a connection, find its source block
    const conn = connections.find(c => c.id === selectedElementId)
    if (conn) {
      return blocks.find(b => b.id === conn.sourceId)
    }
    return undefined
  }, [selectedElementId, blocks, connections])

  const connection = useMemo(() => {
    if (sourceBlock) {
      return connections.find(c => c.sourceId === sourceBlock.id)
    }
    // if selected element is a connection ID directly
    if (connections.find(c => c.id === selectedElementId)){
      return connections.find(c => c.id === selectedElementId)
    }
    return undefined
  }, [sourceBlock, connections, selectedElementId])
  
  useEffect(() => {
    if (saveFormTimer) {
      // ... rest of the code remains the same ...
    }
  }, [saveFormTimer])

  const element = useMemo(() => connection ? {
    id: connection.id,
    source: connection.sourceId,
    target: connection.defaultTargetId,
    data: { connection },
    type: 'workflow'
  } as Edge<WorkflowEdgeData> : null, [connection]);
  
  const handleSetConditionalOrAlways = useCallback((makeConditional: boolean) => {
    if (!connection) return;

    let newRules: Rule[] = [...(connection.rules || [])];

    if (makeConditional) {
      if (!newRules || newRules.length === 0) {
        const newCondition: ConditionRule = {
          id: uuidv4(),
          field: '',
          operator: 'equals',
          value: ''
        };
        const newConditionGroup: Omit<ConditionGroup, 'id'> = { 
          logical_operator: 'AND',
          conditions: [newCondition]
        };
        const newRule: Omit<Rule, 'order_index' | 'name'> & {name?: string} = { 
          id: uuidv4(),
          target_block_id: connection.defaultTargetId || '', 
          condition_group: newConditionGroup as ConditionGroup, 
        };
        newRules = [newRule as Rule]; 
      }
    } else { 
      newRules = [];
    }
    
    updateConnection(connection.id, { rules: newRules });
    setHasPendingSave(true);
  }, [connection, updateConnection]);
  
  const handleConditionChange = useCallback((key: string, value: string | number | boolean, conditionId?: string) => {
    if (!connection || !conditionId) return;

    const currentRules = connection.rules ? [...connection.rules] : [];
    if (currentRules.length === 0 || !currentRules[0].condition_group) return;

    const conditionGroup = currentRules[0].condition_group;
    const conditionIndex = conditionGroup.conditions.findIndex(cond => cond.id === conditionId);

    if (conditionIndex >= 0) {
      const updatedCondition = {
        ...conditionGroup.conditions[conditionIndex],
        [key]: value
      };

      if (key === 'field' && conditionGroup.conditions[conditionIndex].field !== value) {
        updatedCondition.operator = 'equals';
        if (typeof value === 'string' && value.startsWith('choice:')) {
          updatedCondition.value = true;
        } else if (value === 'rating' || (value === 'answer' && sourceBlock?.blockTypeId === 'number')) {
          updatedCondition.value = 0;
        } else if (value === 'selected') {
          updatedCondition.value = true;
        } else {
          updatedCondition.value = '';
        }
      }
      
      const updatedConditions = [...conditionGroup.conditions];
      updatedConditions[conditionIndex] = updatedCondition;
      
      currentRules[0] = {
        ...currentRules[0],
        condition_group: {
          ...conditionGroup,
          conditions: updatedConditions
        }
      };
      
      updateConnection(connection.id, { rules: currentRules });
      setHasPendingSave(true);
    }
  }, [connection, sourceBlock, updateConnection]);
  
  const handleAddCondition = useCallback(() => {
    if (!connection) return;

    const newCondition: ConditionRule = {
      id: uuidv4(),
      field: '',
      operator: 'equals',
      value: ''
    };

    let currentRules = connection.rules ? [...connection.rules] : [];

    if (currentRules.length === 0) {
      const newConditionGroup: Omit<ConditionGroup, 'id'> = {
        logical_operator: 'AND',
        conditions: [newCondition]
      };
      const newRule: Omit<Rule, 'order_index' | 'name'> & {name?: string} = {
        id: uuidv4(),
        target_block_id: connection.defaultTargetId || '', 
        condition_group: newConditionGroup as ConditionGroup,
      };
      currentRules = [newRule as Rule];
    } else {
      if (!currentRules[0].condition_group) { 
        currentRules[0].condition_group = { logical_operator: 'AND', conditions: [] }; 
      }
      const updatedConditions = [...currentRules[0].condition_group.conditions, newCondition];
      currentRules[0] = {
        ...currentRules[0],
        condition_group: {
          ...currentRules[0].condition_group,
          conditions: updatedConditions
        }
      };
    }
    
    updateConnection(connection.id, { rules: currentRules });
    setHasPendingSave(true);
  }, [connection, updateConnection]);
  
  const handleRemoveCondition = useCallback((conditionId: string) => {
    if (!connection || !connection.rules || connection.rules.length === 0 || !connection.rules[0].condition_group) return;

    const currentRules = [...connection.rules];
    const conditionGroup = currentRules[0].condition_group;
    const updatedInnerConditions = conditionGroup.conditions.filter(cond => cond.id !== conditionId);

    if (updatedInnerConditions.length === 0) {
      currentRules.shift(); 
    } else {
      currentRules[0] = {
        ...currentRules[0],
        condition_group: {
          ...conditionGroup,
          conditions: updatedInnerConditions
        }
      };
    }
    
    updateConnection(connection.id, { rules: currentRules });
    setHasPendingSave(true);
  }, [connection, updateConnection]);
  
  const handleSaveChanges = useCallback(() => {
    if (!connection || !hasPendingSave) return;
    try {
      console.log(`Saving connection ${connection.id} rules to database`);
      saveForm();
      setHasPendingSave(false);
    } catch (error) {
      console.error('Error saving connection rules:', error);
    }
  }, [connection, hasPendingSave, saveForm]);
  
  // This adapted handler matches what ConditionCard currently expects for onConditionChange.
  // ConditionCard will be refactored to potentially take a single condition and simpler callbacks.
  const adaptedConditionChangeHandler = useCallback((conditionId: string, key: string, value: string | number | boolean) => {
    handleConditionChange(key, value, conditionId);
  }, [handleConditionChange]);
  
  if (!connection || !element) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-muted-foreground">
        No connection selected
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full p-4 bg-background-secondary border-l border-border-secondary">
      <div className="space-y-6">
        <div 
          className="p-4 space-y-4 max-w-full overflow-hidden" 
          style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
        >
          <h3 className="text-lg font-semibold mb-2">Connection Settings</h3>
          {sourceBlock && connection && (
            <div className="space-y-2">
              <label htmlFor="default-target-select" className="block text-sm font-medium text-foreground">
                Logic from: <span className="italic">&quot;{sourceBlock.title || 'Untitled Question'}&quot;</span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Always go to</span>
                <Select
                  value={connection.defaultTargetId || ''}
                  onValueChange={(newTargetId) => {
                    if (connection) {
                      updateConnection(connection.id, { defaultTargetId: newTargetId });
                      setHasPendingSave(true);
                    }
                  }}
                >
                  <SelectTrigger id="default-target-select" className="flex-grow">
                    <SelectValue placeholder="Select next block...">
                      {blocks.find(b => b.id === connection.defaultTargetId) ? (
                        <BlockPill block={blocks.find(b => b.id === connection.defaultTargetId)} />
                      ) : "Select next block..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {blocks
                      .filter(b => b.id !== (sourceBlock?.id || '')) // Exclude current source block
                      .map(block => (
                        <SelectItem key={block.id} value={block.id}>
                          <BlockPill block={block} />
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        {/* Add Rule Button */}
        <div className="mt-6 pt-4 border-t border-border-secondary">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              if (connection && sourceBlock) { 
                const newRuleId = uuidv4();
                const newConditionId = uuidv4(); 
                
                const newRuleObject = {
                  id: newRuleId,
                  target_block_id: '', 
                  condition_group: {
                    logical_operator: 'AND',
                    conditions: [
                      {
                        id: newConditionId,
                        field: sourceBlock?.id || '', // Changed from source_question_block_id to field
                        operator: 'equals', // Set a valid default operator
                        value: '',    // Will be set by user
                      } as ConditionRule, 
                    ],
                  }
                } as Rule;
                
                const updatedRules = connection.rules ? [...connection.rules, newRuleObject] : [newRuleObject];
                updateConnection(connection.id, { rules: updatedRules });
                setHasPendingSave(true);
                console.log('Add Rule clicked - new rule placeholder added:', newRuleObject);
              }
            }}
          >
            + Add rule
          </Button>
        </div>

        {/* Display existing rules */}
        {connection && connection.rules && connection.rules.length > 0 && (
          <div className="mt-4 space-y-4 max-w-full overflow-hidden">
            {connection.rules.map((rule, index) => (
              <div key={rule.id} className="p-3 border border-border rounded-md shadow-sm bg-background overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-foreground">Rule {index + 1}</p>
                  <Button 
                    variant="outline"
                    size="icon" 
                    className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      if (connection) {
                        const updatedRules = connection.rules.filter(r => r.id !== rule.id);
                        updateConnection(connection.id, { rules: updatedRules });
                        setHasPendingSave(true);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
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
                        onValueChange={(newFieldId) => {
                          if (connection) {
                            const updatedRules = connection.rules.map(r => {
                              if (r.id === rule.id) {
                                const updatedConditions = r.condition_group.conditions.map(c => 
                                  c.id === condition.id ? { ...c, field: newFieldId } : c
                                );
                                return { ...r, condition_group: { ...r.condition_group, conditions: updatedConditions } };
                              }
                              return r;
                            });
                            updateConnection(connection.id, { rules: updatedRules });
                            setHasPendingSave(true);
                          }
                        }}
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
                        onValueChange={(newOperator) => {
                          if (connection) {
                            const updatedRules = connection.rules.map(r => {
                              if (r.id === rule.id) {
                                const updatedConditions = r.condition_group.conditions.map(c => 
                                  c.id === condition.id ? { ...c, operator: newOperator as ConditionRule['operator'] } : c
                                );
                                return { ...r, condition_group: { ...r.condition_group, conditions: updatedConditions } };
                              }
                              return r;
                            });
                            updateConnection(connection.id, { rules: updatedRules });
                            setHasPendingSave(true);
                          }
                        }}
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
                        onChange={(e) => {
                          if (connection) {
                            const newValue = e.target.value;
                            const updatedRules = connection.rules.map(r => {
                              if (r.id === rule.id) {
                                const updatedConditions = r.condition_group.conditions.map(c => 
                                  c.id === condition.id ? { ...c, value: newValue } : c
                                );
                                return { ...r, condition_group: { ...r.condition_group, conditions: updatedConditions } };
                              }
                              return r;
                            });
                            updateConnection(connection.id, { rules: updatedRules });
                            setHasPendingSave(true);
                          }
                        }}
                        className="flex-grow mr-2"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          if (connection) {
                            let updatedRules;
                            const ruleToUpdate = connection.rules.find(r_find => r_find.id === rule.id);
                            if (ruleToUpdate && ruleToUpdate.condition_group.conditions.length === 1) {
                              updatedRules = connection.rules.filter(r_filter => r_filter.id !== rule.id);
                            } else {
                              updatedRules = connection.rules.map(r_map => {
                                if (r_map.id === rule.id) {
                                  const updatedConditions = r_map.condition_group.conditions.filter(c_filter => c_filter.id !== condition.id);
                                  return { ...r_map, condition_group: { ...r_map.condition_group, conditions: updatedConditions } };
                                }
                                return r_map;
                              });
                            }
                            updateConnection(connection.id, { rules: updatedRules });
                            setHasPendingSave(true);
                          }
                        }}
                        aria-label="Delete condition"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Add AND condition button */}
                {rule.condition_group && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full flex items-center justify-center"
                    onClick={() => {
                      if (connection && sourceBlock) {
                        const newConditionId = uuidv4();
                        const newCondition: ConditionRule = {
                          id: newConditionId,
                          field: sourceBlock?.id || '', 
                          operator: 'equals',
                          value: '',
                        };
                        const updatedRules = connection.rules.map(r_map_add => {
                          if (r_map_add.id === rule.id) { 
                            const updatedConditionGroup = {
                              ...r_map_add.condition_group,
                              conditions: [...r_map_add.condition_group.conditions, newCondition],
                            };
                            return { ...r_map_add, condition_group: updatedConditionGroup };
                          }
                          return r_map_add;
                        });
                        updateConnection(connection.id, { rules: updatedRules });
                        setHasPendingSave(true);
                      }
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add AND Condition
                  </Button>
                )}

                {/* THEN Clause: Target Block Dropdown */}
                <div className="flex items-center space-x-2 pt-3 border-t border-border-secondary mt-3 flex-wrap">
                  <span className="text-sm font-medium text-foreground">Then go to</span>
                  <Select
                    value={rule.target_block_id || ''}
                    onValueChange={(newTargetId) => {
                      if (connection) {
                        const updatedRules = connection.rules.map(r => 
                          r.id === rule.id ? { ...r, target_block_id: newTargetId } : r
                        );
                        updateConnection(connection.id, { rules: updatedRules });
                        setHasPendingSave(true);
                      }
                    }}
                  >
                    <SelectTrigger id={`rule-${rule.id}-target-select`} className="flex-grow">
                      <SelectValue placeholder="Select target block...">
                        {blocks.find(b => b.id === rule.target_block_id) ? (
                          <BlockPill block={blocks.find(b => b.id === rule.target_block_id)} />
                        ) : "Select target block..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {blocks
                        .filter(b => b.id !== (sourceBlock?.id || '')) 
                        .map(block => (
                          <SelectItem key={block.id} value={block.id}>
                            <BlockPill block={block} />
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Removed Conditional/Always toggle buttons */}
        
        {/* 
          If a connection is conditional (has rules), render ONE ConditionCard.
          This ConditionCard will be responsible for displaying all conditions within connection.rules[0].condition_group.conditions
          and providing UI to add/remove/edit them using the callbacks.
          This prepares for ConditionCard refactor where it will receive 'currentConnection' and manage its conditions.
        */}
        {connection && (!connection.rules || connection.rules.length === 0) && element && (
          <ConditionCard
            element={element} 
            sourceBlock={sourceBlock}
            sourceBlockType={sourceBlock?.blockTypeId || 'unknown'}
            currentConnection={connection} 
            onConditionTypeChange={(type) => handleSetConditionalOrAlways(type === 'conditional')} 
            onConditionChange={adaptedConditionChangeHandler} 
            onAddCondition={handleAddCondition} 
            onRemoveCondition={handleRemoveCondition} 
          />
        )}
        
        {/* The "Add Condition to Rule 1" button might be redundant if ConditionCard handles adding internally */}
        {/* For now, let's keep it if ConditionCard doesn't immediately offer an add button for an empty rule */}
        {connection.rules && connection.rules.length > 0 && connection.rules[0].condition_group && connection.rules[0].condition_group.conditions.length === 0 && (
            <Button onClick={handleAddCondition} variant="outline" className="w-full">
             Add First Condition to Rule
            </Button>
        )}
         {connection.rules && connection.rules.length > 0 && connection.rules[0].condition_group && connection.rules[0].condition_group.conditions.length > 0 && (
            <Button onClick={handleAddCondition} variant="outline" className="w-full">
             Add Another Condition
            </Button>
        )}


        {/* 'All other cases go to' Display - mirrors the defaultTargetId logic from above */}
        {sourceBlock && connection && (
          <div className="mt-6 pt-4 border-t border-border-secondary space-y-2 p-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">All other cases go to</span>
              <Select
                value={connection.defaultTargetId || ''}
                onValueChange={(newTargetId) => {
                  if (connection) {
                    updateConnectionTarget(connection.id, newTargetId);
                    setHasPendingSave(true);
                  }
                }}
              >
                <SelectTrigger id="all-other-cases-target-select" className="flex-grow">
                  <SelectValue placeholder="Select block...">
                    {connection.is_explicit && blocks.find(b => b.id === connection.defaultTargetId) ? (
                      <BlockPill block={blocks.find(b => b.id === connection.defaultTargetId)!} />
                    ) : (
                      "Select block..."
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {blocks
                    .filter(b => b.id !== sourceBlock.id) 
                    .map(block => (
                      <SelectItem key={block.id} value={block.id}>
                        <BlockPill block={block} />
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {hasPendingSave && (
          <Button onClick={handleSaveChanges} className="w-full mt-6">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}
