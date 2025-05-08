"use client"

import { useState, useCallback, useMemo } from 'react'
import { useFormBuilderStore } from '@/stores/formBuilderStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Edge } from 'reactflow'
import { WorkflowEdgeData, ConditionRule, Connection, Rule, ConditionGroup } from '@/types/workflow-types'
import { ConnectionOverview } from './connection-overview'
import { ConditionCard } from './condition-card' // ConditionCard will be refactored next
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function WorkflowConnectionSidebar() {
  const blocks = useFormBuilderStore(state => state.blocks)
  const connections = useFormBuilderStore(state => state.connections)
  const selectedElementId = useFormBuilderStore(state => state.selectedElementId)
  const updateConnection = useFormBuilderStore(state => state.updateConnection)
  const saveForm = useFormBuilderStore(state => state.saveForm)
  
  const [hasPendingSave, setHasPendingSave] = useState(false)
  
  const connection = useMemo(() => connections.find(conn => conn.id === selectedElementId), [connections, selectedElementId]);
  
  const sourceBlock = useMemo(() => connection ? blocks.find(b => b.id === connection.sourceId) : null, [blocks, connection]);
  const targetBlock = useMemo(() => connection ? blocks.find(b => b.id === connection.defaultTargetId) : null, [blocks, connection]);
  const sourceBlockType = sourceBlock?.blockTypeId || 'unknown'
  
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
        const newConditionGroup: Omit<ConditionGroup, 'id'> = { // ConditionGroup has no id
          logical_operator: 'AND',
          conditions: [newCondition]
        };
        const newRule: Omit<Rule, 'order_index' | 'name'> & {name?: string} = { // Rule has no order_index by default
          id: uuidv4(),
          target_block_id: connection.defaultTargetId || '', 
          condition_group: newConditionGroup as ConditionGroup, // Cast after omitting id
        };
        newRules = [newRule as Rule]; // Cast after omitting order_index
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
        } else if (value === 'rating' || (value === 'answer' && sourceBlockType === 'number')) {
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
  }, [connection, sourceBlockType, updateConnection]);
  
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
        currentRules[0].condition_group = { logical_operator: 'AND', conditions: [] }; // No ID for ConditionGroup
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

    let currentRules = [...connection.rules];
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
        <ConnectionOverview 
          sourceBlock={sourceBlock}
          targetBlock={targetBlock}
          sourceBlockType={sourceBlockType} 
          currentConnection={connection}
        />
        
        <div className="flex space-x-2">
          <Button onClick={() => handleSetConditionalOrAlways(true)} variant={connection.rules && connection.rules.length > 0 ? "default" : "outline"}>Conditional</Button>
          <Button onClick={() => handleSetConditionalOrAlways(false)} variant={!(connection.rules && connection.rules.length > 0) ? "default" : "outline"}>Always</Button>
        </div>

        {/* 
          If a connection is conditional (has rules), render ONE ConditionCard.
          This ConditionCard will be responsible for displaying all conditions within connection.rules[0].condition_group.conditions
          and providing UI to add/remove/edit them using the callbacks.
          This prepares for ConditionCard refactor where it will receive 'currentConnection' and manage its conditions.
        */}
        {connection.rules && connection.rules.length > 0 && element && (
          <ConditionCard
            element={element} // Pass the Edge object
            sourceBlock={sourceBlock}
            sourceBlockType={sourceBlockType}
            currentConnection={connection} // Pass the full connection object
            // Callbacks that ConditionCard expects to manage conditions for the *currentConnection*
            onConditionTypeChange={(type) => handleSetConditionalOrAlways(type === 'conditional')} // Adapt a bit
            onConditionChange={adaptedConditionChangeHandler} // For individual condition changes
            onAddCondition={handleAddCondition} // To add a condition to the current rule
            onRemoveCondition={handleRemoveCondition} // To remove a condition from the current rule
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


        {hasPendingSave && (
          <Button onClick={handleSaveChanges} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}
