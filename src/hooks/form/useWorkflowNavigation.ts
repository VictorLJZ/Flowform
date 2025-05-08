import { useState, useCallback, useMemo } from 'react';
import { Connection, ConditionRule } from '@/types/workflow-types';
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

  // Find the next block based on current answer and conditions
  const findNextBlockIndex = useCallback((currentAnswer: Answer): number => {
    if (!currentBlock) return -1;
    
    console.log(`Finding next block from ${currentBlock.id} with answer:`, currentAnswer);
    
    // Find all connections where this block is the source
    const outgoingConnections = connections.filter(
      conn => conn.sourceId === currentBlock.id
    ).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    
    console.log(`Found ${outgoingConnections.length} outgoing connections`, 
      outgoingConnections.map(c => ({ 
        targetId: c.targetId, 
        conditionType: c.conditionType || 'always',
        hasConditions: !!(c.conditions && c.conditions.length > 0),
        conditionsSummary: c.conditions && c.conditions.length > 0 ? 
          c.conditions.map(cond => `${cond.field} ${cond.operator} ${cond.value}`).join(' AND ') : 'none'
      }))
    );
    
    if (outgoingConnections.length === 0) {
      // No connections, try to go to the next block in sequence
      if (currentIndex < blocks.length - 1) {
        console.log(`No connections found, defaulting to next sequential block at index ${currentIndex + 1}`);
        return currentIndex + 1;
      }
      console.log('No next block found (at end of form)');
      return -1; // No next block
    }
    
    // First check for connections with conditions
    // Separate connections based on their conditionType
    const conditionalConnections = outgoingConnections.filter(conn => conn.conditionType === 'conditional');
    const unconditionalConnections = outgoingConnections.filter(conn => conn.conditionType === 'always');
    const fallbackConnections = outgoingConnections.filter(conn => conn.conditionType === 'fallback');
    
    console.log(`Found ${conditionalConnections.length} conditional, ${unconditionalConnections.length} unconditional, and ${fallbackConnections.length} fallback connections`);
    
    // First try to find a connection with matching conditions
    for (const connection of conditionalConnections) {
      // Skip connections without conditions
      if (!connection.conditions || connection.conditions.length === 0) continue;
      
      try {
        // Check if ALL conditions are met (AND logic)
        let allConditionsMet = true;
        
        for (const condition of connection.conditions) {
          const conditionMet = evaluateCondition(
            condition,
            currentAnswer,
            currentBlock.blockTypeId || 'unknown'
          );
          
          console.log(`Evaluating condition for connection to ${connection.targetId}: ${conditionMet ? 'MATCH' : 'no match'}`);
          
          // If any condition fails, the whole connection fails (AND logic)
          if (!conditionMet) {
            allConditionsMet = false;
            break;
          }
        }
        
        // If all conditions are met, navigate to this target
        if (allConditionsMet) {
          const targetIndex = findBlockIndex(connection.targetId);
          if (targetIndex >= 0) {
            console.log(`Conditions matched, navigating to block at index ${targetIndex}`);
            
            // Add this path to navigation history for debugging
            const conditionSummary = connection.conditions.map(c => 
              `${c.field} ${c.operator} ${c.value}`
            ).join(' AND ');
            
            setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${connection.targetId} (${conditionSummary})`]);
            
            return targetIndex;
          }
        }
      } catch (error) {
        console.error(`Error evaluating conditions for connection ${connection.id}:`, error);
      }
    }
    
    // If no conditional path matched, try an "always" path
    if (unconditionalConnections.length > 0) {
      const alwaysConnection = unconditionalConnections[0]; // Take the first 'always' connection
      const targetIndex = findBlockIndex(alwaysConnection.targetId);
      if (targetIndex >= 0) {
        console.log(`Using 'always' connection to block at index ${targetIndex}`);
        
        // Add this path to navigation history for debugging
        setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${alwaysConnection.targetId} (always)`]);
        
        return targetIndex;
      }
    }
    
    // If no 'always' path exists, try a fallback path
    if (fallbackConnections.length > 0) {
      const fallbackConnection = fallbackConnections[0]; // Take the first fallback connection
      const targetIndex = findBlockIndex(fallbackConnection.targetId);
      if (targetIndex >= 0) {
        console.log(`Using fallback connection to block at index ${targetIndex}`);
        
        // Add this path to navigation history for debugging
        setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${fallbackConnection.targetId} (fallback)`]);
        
        return targetIndex;
      }
    }
    
    // If nothing matched, try going to next sequential block
    if (currentIndex < blocks.length - 1) {
      console.log(`No matching connections, defaulting to next sequential block at index ${currentIndex + 1}`);
      return currentIndex + 1;
    }
    
    // No next block found
    console.log('No next block found (reached end of form)');
    return -1;
  }, [blocks, connections, currentBlock, currentIndex, evaluateCondition, findBlockIndex]);

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