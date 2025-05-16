import { useState, useCallback, useMemo } from 'react';
import { Connection, ConditionRule, ConditionGroup } from '@/types/workflow-types';
import { UiBlock } from '@/types/block/UiBlock';
import { ApiQAPair } from '@/types/response';

// Using unknown[] is more type-safe than any[] but still allows for flexibility
// We need this flexibility due to the variety of answer types in the system
// Using union types to maintain flexibility for all answer types
type Answer = string | number | string[] | boolean | Record<string, unknown> | ApiQAPair[];

interface WorkflowNavigationProps {
  blocks: UiBlock[];
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
  // Enhanced logging and connection validation to detect regenerated connections
  console.log('🔎📈 [useWorkflowNavigation] Received connections:', connections.map(c => ({
    id: c.id,
    sourceId: c.sourceId,
    defaultTargetId: c.defaultTargetId,
    hasRules: !!(c.rules && c.rules.length > 0),
    rulesCount: c.rules?.length || 0,
    rulesType: typeof c.rules,
    isRulesArray: Array.isArray(c.rules),
    firstRule: c.rules && c.rules.length > 0 ? (() => {
      try {
        const stringified = JSON.stringify(c.rules[0]);
        return stringified && typeof stringified === 'string' 
          ? stringified.substring(0, 100) + (stringified.length > 100 ? '...' : '')
          : '[invalid rule]';
      } catch {
        return '[rule with non-serializable data]';
      }
    })() : null
  })));
  
  // Debug: Inspect first connection's rules in detail if available
  if (connections.length > 0) {
    const firstConn = connections[0];
    console.log(`🔎📈 [CONN_DEBUG] First connection ${firstConn.id} detailed:`, {
      sourceId: firstConn.sourceId,
      defaultTargetId: firstConn.defaultTargetId,
      rules: firstConn.rules,
      rulesStringified: JSON.stringify(firstConn.rules)
    });
  }
  
  // Create a defensive copy of connections to ensure they have their rules preserved
  // This protects against unexpected regeneration of connection objects
  const validatedConnections = useMemo(() => {
    console.log('🛡️🔍 [CONNECTION_VALIDATOR] Validating incoming connections for workflow navigation');
    
    // Check if the IDs match known patterns for generated IDs vs. database IDs
    const possiblyRegenerated = connections.some(conn => 
      conn.rules?.length === 0 && conn.id && conn.id.length === 36);
    
    if (possiblyRegenerated) {
      console.warn('⚠️ [CONNECTION_VALIDATOR] Detected possible connection regeneration - connections have correct ID format but empty rules');
    }
    
    // Return the original connections - we've added this validation step to help debug
    // In a future version, we could use a deeper merge strategy here if needed
    return connections;
  }, [connections]);
  
  // Use the validated connections from here on
  const workflowConnections = validatedConnections;
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
    type: "answer", content: Answer,
    subtype: string
  ): boolean => {
    if (!condition || !condition.field) return true;
    
    const { field, operator, value } = condition;
    console.log(`🔍🔎🔬 [CONDITION_EVAL] Evaluating condition: field=${field}, operator=${operator}, value=${value}, blockType=${subtype}, answer=`, content);
    
    // Handle null/undefined answers
    if (content === null || content === undefined) {
      console.log('🔍🔎🔬 [CONDITION_EVAL] Answer is null or undefined, condition fails');
      return false;
    }
    
    // Special handling for blocks that use option IDs and labels (multiple_choice, dropdown, checkbox_group)
    if ((subtype === 'multiple_choice' || subtype === 'dropdown') && 
        typeof content === 'string' && 
        content.startsWith('option-')) {
      // The field in this case is the block ID (not a specific 'field' within the block)
      // Get the source block from the field ID
      const sourceBlock = blocks.find(block => block.id === field);
      if (!sourceBlock) {
        console.warn(`🔍🔎🔬 [CONDITION_EVAL] Source block ${field} not found for condition`);
        return false;
      }
      
      // Get options from the block settings
      const options = Array.isArray(sourceBlock.settings?.options) 
        ? sourceBlock.settings.options 
        : [];
      
      if (options.length === 0) {
        console.warn(`🔍🔎🔬 [CONDITION_EVAL] No options found in source block ${field}`);
        return false;
      }
      
      // Find the selected option by ID
      const selectedOption = options.find((option: {id: string; label: string}) => option.id === content);
      if (!selectedOption) {
        console.warn(`🔍🔎🔬 [CONDITION_EVAL] Selected option ${content} not found in source block's options`);
        return false;
      }
      
      // Compare the option's label with the rule's value
      const matches = selectedOption.label === value;
      
      console.log(`🔍🔎🔬 [CONDITION_EVAL] ${subtype}: ${content} (label: "${selectedOption.label}") ${matches ? 'matches' : 'does not match'} rule value "${value}"`);
      return operator === 'equals' ? matches : !matches;
    }
    
    // Special handling for checkbox_group (array of option IDs)
    if (subtype === 'checkbox_group' && Array.isArray(content) && content.length > 0 && 
        typeof content[0] === 'string' && content[0].startsWith('option-')) {
      // The field is the block ID
      const sourceBlock = blocks.find(block => block.id === field);
      if (!sourceBlock) {
        console.warn(`🔍🔎🔬 [CONDITION_EVAL] Source block ${field} not found for checkbox group condition`);
        return false;
      }
      
      // Get options from the block settings
      const options = Array.isArray(sourceBlock.settings?.options) 
        ? sourceBlock.settings.options 
        : [];
      
      if (options.length === 0) {
        console.warn(`🔍🔎🔬 [CONDITION_EVAL] No options found in checkbox group block ${field}`);
        return false;
      }

      // For checkbox groups, we need to handle multiple selections
      if (operator === 'equals') {
        // Check if the value exists in the selected options
        for (const selectedId of content) {
          const selectedOption = options.find((option: {id: string; label: string}) => option.id === selectedId);
          if (selectedOption && selectedOption.label === value) {
            console.log(`🔍🔎🔬 [CONDITION_EVAL] Checkbox group: found match for "${value}" in selected options`);
            return true;
          }
        }
        console.log(`🔍🔎🔬 [CONDITION_EVAL] Checkbox group: no match for "${value}" in selected options`);
        return false;
      } else if (operator === 'not_equals') {
        // Check that the value does NOT exist in any selected option
        for (const selectedId of content) {
          const selectedOption = options.find((option: {id: string; label: string}) => option.id === selectedId);
          if (selectedOption && selectedOption.label === value) {
            console.log(`🔍🔎🔬 [CONDITION_EVAL] Checkbox group: found match for "${value}" in selected options (not_equals fails)`);
            return false; // Found a match, so not_equals fails
          }
        }
        console.log(`🔍🔎🔬 [CONDITION_EVAL] Checkbox group: no match for "${value}" in selected options (not_equals passes)`);
        return true;
      }
      
      // If we reach here, the condition couldn't be properly evaluated
      console.warn(`Checkbox group condition couldn't be properly evaluated with operator ${operator}`);
      return false;
    }
    
    // Special handling for different block types and field types
    if (field.startsWith('choice:')) {
      // Handle choice selections (checkboxes, radio buttons, etc.)
      const choiceValue = field.split(':')[1];
      
      if (Array.isArray(content)) {
        // For multiple choice where content is an array of selections
        // Type safe check for primitive values in array
        const isSelected = content.some(item => 
          (typeof item === 'string' || typeof item === 'number') && item.toString() === choiceValue
        );
        console.log(`Choice ${choiceValue} is ${isSelected ? 'selected' : 'not selected'} in ${JSON.stringify(content)}`);
        return operator === 'equals' ? isSelected : !isSelected;
      } else if (typeof content === 'string') {
        // Single selection where content is a string
        const matches = content === choiceValue;
        console.log(`Choice ${choiceValue} ${matches ? 'matches' : 'does not match'} answer "${content}"`);
        return operator === 'equals' ? matches : !matches;
      }
    } else if (field === 'selected' && subtype === 'checkbox_group') {
      // For checkbox groups
      const hasSelection = Array.isArray(content) && content.length > 0;
      console.log(`Checkbox group has ${hasSelection ? 'selections' : 'no selections'}`);
      return operator === 'equals' ? 
        (value === true ? hasSelection : !hasSelection) :
        (value === true ? !hasSelection : hasSelection);
    } else if (field === 'answer') {
      // For text, number, or similar inputs
      console.log(`Comparing answer "${content}" ${operator} value "${value}"`);
      
      // Handle string option IDs from multiple choice/dropdown
      if (subtype === 'multiple_choice' || subtype === 'dropdown') {
        const stringAnswer = String(content);
        const stringValue = String(value);
        
        if (operator === 'equals') {
          return stringAnswer === stringValue;
        } else if (operator === 'not_equals') {
          return stringAnswer !== stringValue;
        }
      }
      
      if (operator === 'equals') {
        // Handle type coercion for common cases
        if (typeof content === 'number' && typeof value === 'string') {
          return content === Number(value);
        } else if (typeof content === 'string' && typeof value === 'number') {
          return Number(content) === value;
        }
        return content === value;
      } else if (operator === 'not_equals') {
        // Handle type coercion for common cases
        if (typeof content === 'number' && typeof value === 'string') {
          return content !== Number(value);
        } else if (typeof content === 'string' && typeof value === 'number') {
          return Number(content) !== value;
        }
        return content !== value;
      } else if (operator === 'contains' && typeof content === 'string') {
        return content.includes(String(value));
      } else if (operator === 'greater_than') {
        const numAnswer = typeof content === 'string' ? Number(content) : content;
        const numValue = typeof value === 'string' ? Number(value) : value;
        
        if (typeof numAnswer === 'number' && typeof numValue === 'number') {
          return numAnswer > numValue;
        }
        return false;
      } else if (operator === 'less_than') {
        const numAnswer = typeof content === 'string' ? Number(content) : content;
        const numValue = typeof value === 'string' ? Number(value) : value;
        
        if (typeof numAnswer === 'number' && typeof numValue === 'number') {
          return numAnswer < numValue;
        }
        return false;
      }
    }
    
    // If we reach here, the condition wasn't properly evaluated
    console.warn(`Condition couldn't be properly evaluated:`, { field, operator, value, content, subtype });
    
    // Default fallback - by default we allow navigation if we can't evaluate
    return true;
  }, [blocks]);

  // Helper to evaluate a ConditionGroup
  const evaluateRuleConditionGroup = useCallback((
    conditionGroup: ConditionGroup | undefined,
    type: "answer", content: Answer,
    subtype: string
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
      results.push(evaluateCondition(condition, "answer", content, subtype));
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
    console.log(`🧭🧮🔀 [NEXT_BLOCK] Evaluating connections to find next block after ${currentBlock?.id}`);
    // Ensure we have a current block
    if (!currentBlock) {
      console.log('🧭🧮🔀 [NEXT_BLOCK] No current block, cannot find next');
      return -1;
    }
    
    console.log('🧭🧮🔀 [NEXT_BLOCK] Finding next block for:', {
      currentBlockId: currentBlock.id,
      currentBlockTitle: currentBlock.title,
      currentAnswer,
      totalConnections: workflowConnections.length
    });
    
    // Get all connections from the current block, without sorting by order_index
    // This allows us to properly evaluate rules without being influenced by a predefined order
    const outgoingConnections = workflowConnections.filter(
      conn => conn.sourceId === currentBlock.id
    );
    
    console.log(`🧭🧮🔀 [NEXT_BLOCK] Found ${outgoingConnections.length} outgoing connections:`, 
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
      console.log('🧭🧮🔀 [NEXT_BLOCK] No outgoing connections from current block. Trying sequential navigation.');
      if (currentIndex < blocks.length - 1) {
        console.log(`🧭🧮🔀 [NEXT_BLOCK] No connections. Defaulting to next sequential block: ${blocks[currentIndex + 1]?.id}`);
        setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${blocks[currentIndex + 1]?.id} (sequential)`]);
        return currentIndex + 1;
      }
      console.log('[useWorkflowNavigation] No next block found (at end of form, no outgoing connections).');
      return -1;
    }
    
    for (const connection of outgoingConnections) {
      console.log(`🧭🧮🔀 [NEXT_BLOCK] Evaluating connection: ${connection.id}, default target: ${connection.defaultTargetId}`);
      if (connection.rules && connection.rules.length > 0) {
        console.log(`🧩📝🔖 [RULE_EVAL]   Connection has ${connection.rules.length} rules, evaluating...`);
        for (const rule of connection.rules) {
          console.log(`🧩📝🔖 [RULE_EVAL]     Evaluating rule ${rule.id} targeting block ${rule.target_block_id}`);
          const ruleConditionsMet = evaluateRuleConditionGroup(
            rule.condition_group,
            "answer",
            currentAnswer,
            currentBlock.subtype || 'unknown'
          );
          
          if (ruleConditionsMet) {
            console.log(`🧩📝🔖 [RULE_EVAL]     Rule ${rule.id} matched! Finding target block ${rule.target_block_id}`);
            const targetIndex = findBlockIndex(rule.target_block_id);
            if (targetIndex !== -1) {
              const conditionSummary = rule.condition_group.conditions
                .map(c => `${c.field} ${c.operator} ${c.value}`)
                .join(` ${rule.condition_group.logical_operator} `);
              setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${rule.target_block_id} (rule: ${conditionSummary})`]);
              return targetIndex;
            } else {
              console.warn(`🧩📝🔖 [RULE_EVAL]     Rule matched but target block ${rule.target_block_id} not found.`);
            }
          }
        }
        // If all rules on this connection were evaluated and none matched, 
        // we consider this connection's path via rules as not taken.
        // We will then check its defaultTargetId (if any) AFTER checking rules of OTHER connections if this defaultTargetId is not set.
        // The loop continues to the next connection unless this one has a defaultTargetId that gets picked up.
        console.log(`🧩📝🔖 [RULE_EVAL]   No rules matched for connection ${connection.id}.`);
      }

      // If we are here, either the connection had no rules, or its rules didn't match.
      // Try its defaultTargetId *if it exists*. The overall loop will continue to next connection if this one doesn't lead anywhere.
      if (connection.defaultTargetId) {
        console.log(`🧩📝🔖 [RULE_EVAL]   Connection has no matching rules (or no rules). Trying default target: ${connection.defaultTargetId}`);
        const targetIndex = findBlockIndex(connection.defaultTargetId);
        if (targetIndex !== -1) {
          console.log(`🧩📝🔖 [RULE_EVAL]   Default target ${connection.defaultTargetId} found. Navigating.`);
          setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${connection.defaultTargetId} (default for connection ${connection.id})`]);
          return targetIndex;
        }
      }
    }
    
    // If the loop completes, no rules matched and no default targets on any connection led to a valid block.
    // Since we've evaluated all connections and their rules without finding a match,
    // we should NOT fall back to sequential navigation as that would bypass the workflow logic.
    // This is by design - if no rules or defaults match, we should stop navigation.
    console.log('[useWorkflowNavigation] All connections evaluated, no path found.');
    // Only use sequential navigation if there were no connections at all
    if (outgoingConnections.length === 0 && currentIndex < blocks.length - 1) {
      console.log(`[useWorkflowNavigation] No connections defined. Defaulting to next sequential block: ${blocks[currentIndex + 1]?.id}`);
      setNavigationPath(prev => [...prev, `${currentBlock.id} -> ${blocks[currentIndex + 1]?.id} (sequential fallback - no connections)`]);
      return currentIndex + 1;
    }

    console.log('[useWorkflowNavigation] No next block found after evaluating all connections and sequential options.');
    return -1; // No next block found
  }, [currentBlock, workflowConnections, blocks, currentIndex, findBlockIndex, evaluateRuleConditionGroup, setNavigationPath]);

  // Navigate to the next block based on the current answer and conditions
  const goToNext = useCallback((currentAnswer: Answer) => {
    console.log('🚀⚡️🔄 [NAVIGATION] goToNext called with type: "answer", content:', currentAnswer);
    
    const nextIndex = findNextBlockIndex(currentAnswer);
    
    if (nextIndex >= 0) {
      setDirection(1);
      setCurrentIndex(nextIndex);
      
      // Update navigation history
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), nextIndex];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      console.log(`🚀⚡️🔄 [NAVIGATION] Successfully navigated to block at index ${nextIndex} (${blocks[nextIndex]?.title || 'Unknown'})`);
      return true;
    }
    
    console.log('🚀⚡️🔄 [NAVIGATION] Failed to navigate: no valid next block found');
    return false;
  }, [findNextBlockIndex, navigationHistory, historyIndex, blocks]);

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
    
    // Get connections from current block to possible target blocks
    const outgoingConnections = workflowConnections.filter(
      conn => conn.sourceId === currentBlock.id
    );
    
    console.log(`🧭🧮🔀 [NEXT_BLOCK] Found ${outgoingConnections.length} connections from current block ID ${currentBlock.id}`);
    
    if (outgoingConnections.length > 0) {
      outgoingConnections.forEach((conn, idx) => {
        console.log(`🧭🧮🔀 [NEXT_BLOCK] Connection #${idx+1}:`, {
          id: conn.id,
          defaultTargetId: conn.defaultTargetId,
          hasRules: conn.rules && conn.rules.length > 0,
          ruleCount: conn.rules ? conn.rules.length : 0,
          rules: conn.rules
        });
      });
    }
    
    // If there are no outgoing connections, this is the last question
    return outgoingConnections.length === 0;
  }, [currentBlock, workflowConnections]);

  // We're not using a callback for logging navigation path - it's only used for return value
  // Removed unused function to fix the build error

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