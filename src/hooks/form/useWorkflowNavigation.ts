import { useState, useCallback, useMemo } from 'react';
import { Connection, ConditionRule, ConditionGroup } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';

// Using unknown[] is more type-safe than any[] but still allows for flexibility
// We need this flexibility due to the variety of answer types in the system
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Answer = string | number | string[] | boolean | any;

interface WorkflowNavigationProps {
  blocks: FormBlock[];
  connections: Connection[];
  initialBlockIndex?: number;
}

/**
 * Custom hook to handle navigation based on workflow connections and conditions
 * Extends the basic form navigation with support for conditional branching
 */
export function useWorkflowNavigation({
  blocks,
  connections,
  initialBlockIndex = 0
}: WorkflowNavigationProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialBlockIndex);
  const [direction, setDirection] = useState<number>(1); // 1 for next, -1 for previous
  const [navigationHistory, setNavigationHistory] = useState<number[]>([initialBlockIndex]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);

  // Current block for convenience
  const currentBlock = useMemo(() => {
    if (blocks.length === 0 || currentIndex < 0 || currentIndex >= blocks.length) {
      return null;
    }
    return blocks[currentIndex];
  }, [blocks, currentIndex]);

  // Helper function to find a block's index by id
  const findBlockIndex = useCallback((blockId: string): number => {
    return blocks.findIndex(block => block.id === blockId);
  }, [blocks]);

  // Evaluate if a condition is met based on the current answer
  const evaluateCondition = useCallback((
    condition: ConditionRule, 
    answer: Answer,
    blockTypeId: string
  ): boolean => {
    if (!condition || !condition.field) return true;
    
    const { field, operator, value } = condition;
    console.log(`Evaluating condition: field=${field}, operator=${operator}, value=${value}, answer=`, answer);
    
    // Handle null/undefined answers
    if (answer === null || answer === undefined) {
      console.log('Answer is null or undefined, condition fails');
      return false;
    }
    
    // Special handling for different block types and field types
    if (field.startsWith('choice:')) {
      // Handle choice selections (checkboxes, radio buttons, etc.)
      const choiceValue = field.split(':')[1];
      
      if (Array.isArray(answer)) {
        // For multiple choice where answer is an array of selections
        const isSelected = answer.includes(choiceValue);
        console.log(`Choice ${choiceValue} is ${isSelected ? 'selected' : 'not selected'} in ${JSON.stringify(answer)}`);
        return operator === 'equals' ? isSelected : !isSelected;
      } else if (typeof answer === 'string') {
        // Single selection where answer is a string
        const matches = answer === choiceValue;
        console.log(`Choice ${choiceValue} ${matches ? 'matches' : 'does not match'} answer "${answer}"`);
        return operator === 'equals' ? matches : !matches;
      }
    } else if (field === 'selected' && blockTypeId === 'checkbox_group') {
      // For checkbox groups
      const hasSelection = Array.isArray(answer) && answer.length > 0;
      console.log(`Checkbox group has ${hasSelection ? 'selections' : 'no selections'}`);
      return operator === 'equals' ? 
        (value === true ? hasSelection : !hasSelection) :
        (value === true ? !hasSelection : hasSelection);
    } else if (field === 'answer') {
      // For text, number, or similar inputs
      console.log(`Comparing answer "${answer}" ${operator} value "${value}"`);
      
      // Handle string option IDs from multiple choice/dropdown
      if (blockTypeId === 'multiple_choice' || blockTypeId === 'dropdown') {
        const stringAnswer = String(answer);
        const stringValue = String(value);
        
        if (operator === 'equals') {
          return stringAnswer === stringValue;
        } else if (operator === 'not_equals') {
          return stringAnswer !== stringValue;
        }
      }
      
      if (operator === 'equals') {
        // Handle type coercion for common cases
        if (typeof answer === 'number' && typeof value === 'string') {
          return answer === Number(value);
        } else if (typeof answer === 'string' && typeof value === 'number') {
          return Number(answer) === value;
        }
        return answer === value;
      } else if (operator === 'not_equals') {
        // Handle type coercion for common cases
        if (typeof answer === 'number' && typeof value === 'string') {
          return answer !== Number(value);
        } else if (typeof answer === 'string' && typeof value === 'number') {
          return Number(answer) !== value;
        }
        return answer !== value;
      } else if (operator === 'contains' && typeof answer === 'string') {
        return answer.includes(String(value));
      } else if (operator === 'greater_than') {
        const numAnswer = typeof answer === 'string' ? Number(answer) : answer;
        const numValue = typeof value === 'string' ? Number(value) : value;
        
        if (typeof numAnswer === 'number' && typeof numValue === 'number') {
          return numAnswer > numValue;
        }
        return false;
      } else if (operator === 'less_than') {
        const numAnswer = typeof answer === 'string' ? Number(answer) : answer;
        const numValue = typeof value === 'string' ? Number(value) : value;
        
        if (typeof numAnswer === 'number' && typeof numValue === 'number') {
          return numAnswer < numValue;
        }
        return false;
      }
    }
    
    // If we reach here, the condition wasn't properly evaluated
    console.warn(`Condition couldn't be properly evaluated:`, { field, operator, value, answer, blockTypeId });
    
    // Default fallback - by default we allow navigation if we can't evaluate
    return true;
  }, []);

  // Helper to evaluate a ConditionGroup
  const evaluateRuleConditionGroup = useCallback((
    conditionGroup: ConditionGroup | undefined,
    answer: Answer,
    blockTypeId: string
  ): boolean => {
    if (!conditionGroup || !conditionGroup.conditions || conditionGroup.conditions.length === 0) {
      // An empty condition group or no conditions can be considered as 'true' 
      // if the rule itself is meant to be an unconditional jump within a ruleset, 
      // or 'false' if conditions are strictly required. 
      // For now, let's assume if a condition_group exists but is empty, its conditions are met (vacuously true).
      // If the rule *shouldn't* run without conditions, the condition_group shouldn't be empty.
      // This might need refinement based on how empty groups are intended to behave.
      // Let's default to true: an empty set of AND conditions is true, an empty set of OR conditions is false.
      // For simplicity now, if group is present but empty conditions, let's say true for this rule part.
      return true; // Or based on logical_operator: AND -> true, OR -> false if empty
    }

    const results: boolean[] = [];
    for (const condition of conditionGroup.conditions) {
      results.push(evaluateCondition(condition, answer, blockTypeId));
    }

    if (conditionGroup.logical_operator === 'AND') {
      return results.every(res => res);
    } else if (conditionGroup.logical_operator === 'OR') {
      return results.some(res => res);
    }
    return true; // Default if operator is somehow not AND/OR
  }, [evaluateCondition]);

  // Find the next block based on current answer and conditions
  const findNextBlockIndex = useCallback((currentAnswer: Answer): number => {
    if (!currentBlock) return -1;
    
    console.log(`[useWorkflowNavigation] Finding next block from ${currentBlock.id} (${currentBlock.blockTypeId}) with answer:`, currentAnswer);
    
    const outgoingConnections = connections.filter(
      conn => conn.sourceId === currentBlock.id
    ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    
    console.log(`[useWorkflowNavigation] Found ${outgoingConnections.length} outgoing connections:`, 
      outgoingConnections.map(c => ({ 
        id: c.id,
        sourceId: c.sourceId,
        defaultTargetId: c.defaultTargetId,
        rulesCount: c.rules?.length || 0,
        rulesSummary: c.rules?.map(r => 
          `to: ${r.target_block_id}, conditions: ${r.condition_group?.conditions.length || 0} (${r.condition_group?.logical_operator || 'N/A'})`
        ).join('; ') || 'none',
        order_index: c.order_index
      }))
    );
    
    if (outgoingConnections.length === 0) {
      if (currentIndex < blocks.length - 1) {
        console.log(`[useWorkflowNavigation] No connections. Defaulting to next sequential block: ${blocks[currentIndex + 1]?.id}`);
        setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${blocks[currentIndex + 1]?.id} (sequential)`]);
        return currentIndex + 1;
      }
      console.log('[useWorkflowNavigation] No next block found (at end of form, no outgoing connections).');
      return -1;
    }
    
    for (const connection of outgoingConnections) {
      console.log(`[useWorkflowNavigation] Evaluating connection: ${connection.id}, default target: ${connection.defaultTargetId}`);
      if (connection.rules && connection.rules.length > 0) {
        for (const rule of connection.rules) { // Assuming rules are ordered if necessary by their position in the array
          console.log(`[useWorkflowNavigation]   Evaluating rule: ${rule.id}, target: ${rule.target_block_id}`);
          const ruleConditionsMet = evaluateRuleConditionGroup(
            rule.condition_group,
            currentAnswer,
            currentBlock.blockTypeId || 'unknown'
          );
          
          if (ruleConditionsMet) {
            console.log(`[useWorkflowNavigation]   Rule MATCHED. Navigating to rule target: ${rule.target_block_id}`);
            const targetIndex = findBlockIndex(rule.target_block_id);
            if (targetIndex !== -1) {
              const conditionSummary = rule.condition_group.conditions
                .map(c => `${c.field} ${c.operator} ${c.value}`)
                .join(` ${rule.condition_group.logical_operator} `);
              setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${rule.target_block_id} (rule: ${conditionSummary})`]);
              return targetIndex;
            } else {
              console.warn(`[useWorkflowNavigation]   Rule matched but target block ${rule.target_block_id} not found.`);
            }
          }
        }
        // If all rules on this connection were evaluated and none matched, 
        // we consider this connection's path via rules as not taken.
        // We will then check its defaultTargetId (if any) AFTER checking rules of OTHER connections if this defaultTargetId is not set.
        // The loop continues to the next connection unless this one has a defaultTargetId that gets picked up.
        console.log(`[useWorkflowNavigation]   No rules matched for connection ${connection.id}.`);
      }

      // If we are here, either the connection had no rules, or its rules didn't match.
      // Try its defaultTargetId *if it exists*. The overall loop will continue to next connection if this one doesn't lead anywhere.
      if (connection.defaultTargetId) {
        console.log(`[useWorkflowNavigation]   Connection ${connection.id} has no matching rules (or no rules). Trying default target: ${connection.defaultTargetId}`);
        const targetIndex = findBlockIndex(connection.defaultTargetId);
        if (targetIndex !== -1) {
          console.log(`[useWorkflowNavigation]   Default target ${connection.defaultTargetId} found. Navigating.`);
          setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${connection.defaultTargetId} (default for connection ${connection.id})`]);
          return targetIndex;
        }
      }
    }
    
    // If the loop completes, no rules matched and no default targets on any connection led to a valid block.
    // This means no explicit navigation path was found through connections.
    // Try sequential as a last resort if not already handled (original lines 165-171)
    // This part is a bit redundant now as the no-connections case handles sequential.
    // If connections exist but none lead anywhere, it's an explicit stop or misconfiguration.
    console.log('[useWorkflowNavigation] All connections evaluated, no path found.');
    if (currentIndex < blocks.length - 1) {
      console.log(`[useWorkflowNavigation] No connections led to a block. Defaulting to next sequential block: ${blocks[currentIndex + 1]?.id}`);
      setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${blocks[currentIndex + 1]?.id} (sequential fallback after connections)`]);
      return currentIndex + 1;
    }

    console.log('[useWorkflowNavigation] No next block found after evaluating all connections and sequential options.');
    return -1; // No next block found
  }, [currentBlock, connections, blocks, currentIndex, findBlockIndex, evaluateCondition, evaluateRuleConditionGroup, setNavigationPath]);

  // Navigate to the next block based on the current answer and conditions
  const goToNext = useCallback((currentAnswer: Answer) => {
    console.log('goToNext called with answer:', currentAnswer);
    
    const nextIndex = findNextBlockIndex(currentAnswer);
    
    if (nextIndex >= 0) {
      setDirection(1);
      setCurrentIndex(nextIndex);
      
      // Update navigation history
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), nextIndex];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      console.log(`Successfully navigated to block at index ${nextIndex}`);
      return true;
    }
    
    console.log('Failed to navigate: no valid next block found');
    return false;
  }, [findNextBlockIndex, navigationHistory, historyIndex]);

  // Go back to the previous block in history
  const goToPrevious = useCallback(() => {
    if (historyIndex > 0) {
      setDirection(-1);
      const prevIndex = navigationHistory[historyIndex - 1];
      setCurrentIndex(prevIndex);
      setHistoryIndex(historyIndex - 1);
      return true;
    }
    return false;
  }, [navigationHistory, historyIndex]);

  // Reset the navigation
  const resetNavigation = useCallback(() => {
    setCurrentIndex(initialBlockIndex);
    setDirection(1);
    setNavigationHistory([initialBlockIndex]);
    setHistoryIndex(0);
    setNavigationPath([]);
  }, [initialBlockIndex]);

  // Check if we're at the last question (no more connections)
  const isLastQuestion = useMemo(() => {
    if (!currentBlock) return false;
    
    // Find all outgoing connections
    const outgoingConnections = connections.filter(
      conn => conn.sourceId === currentBlock.id
    );
    
    // If there are no outgoing connections, this is the last question
    return outgoingConnections.length === 0;
  }, [currentBlock, connections]);

  // Log navigation path for debugging
  useCallback(() => {
    console.log('Current navigation path:', navigationPath);
  }, [navigationPath]);

  return {
    currentIndex,
    currentBlock,
    direction,
    goToNext,
    goToPrevious,
    resetNavigation,
    isLastQuestion,
    navigationPath,
  };
} 