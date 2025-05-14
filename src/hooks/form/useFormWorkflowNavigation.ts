/**
 * This hook is a compatibility layer that bridges useWorkflowNavigation with components
 * that expect the simpler interface of useFormNavigation.
 * 
 * It allows existing form viewer components to use the more sophisticated
 * workflow-based navigation without requiring major refactoring.
 */

import { useCallback, useState, useMemo } from 'react';
import { useWorkflowNavigation } from './useWorkflowNavigation';
import { Connection, Rule } from '@/types/workflow-types';
import { FormBlock } from '@/types/block-types';
import { ApiQAPair } from '@/types/response';
import { LegacyQAPair } from '@/utils/type-utils/response/LegacyQAPairAdapter';

// Answer types can be varied based on the block type
type Answer = string | number | string[] | boolean | Record<string, unknown> | ApiQAPair[] | LegacyQAPair[];

interface FormWorkflowNavigationProps {
  blocks: FormBlock[];
  connections: Connection[];
  initialBlockIndex?: number;
}

export function useFormWorkflowNavigation({
  blocks,
  connections,
  initialBlockIndex = 0
}: FormWorkflowNavigationProps) {
  // Store answers for all blocks to evaluate conditions
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  
  // Check for and fix regenerated connections by preserving rules based on source and target IDs
  const preservedConnections = useMemo(() => {
    // Log original connections for debugging
    console.log('🧩🔍 [FORM_WORKFLOW] Original connections:', connections.map(c => ({
      id: c.id,
      sourceId: c.sourceId,
      targetId: c.defaultTargetId,
      rulesCount: c.rules?.length || 0
    })));
    
    // Get connections with rules
    const connectionsWithRules = connections.filter(c => 
      c.rules && c.rules.length > 0
    );
    
    // If there are no rules to preserve, return original connections
    if (connectionsWithRules.length === 0) {
      console.log('🧩🔍 [FORM_WORKFLOW] No rules to preserve, using original connections');
      return connections;
    }
    
    // Create a lookup map for quick access to connections with rules
    const ruleLookup = new Map<string, Rule[]>();
    connectionsWithRules.forEach(conn => {
      // Create a key based on source and target IDs
      const key = `${conn.sourceId}->${conn.defaultTargetId}`;
      ruleLookup.set(key, conn.rules);
    });
    
    console.log(`🧩🔍 [FORM_WORKFLOW] Created rule lookup with ${ruleLookup.size} entries`);
    
    // Return enhanced connections with preserved rules
    return connections.map(conn => {
      const key = `${conn.sourceId}->${conn.defaultTargetId}`;
      const preservedRules = ruleLookup.get(key);
      
      // If this connection should have rules but doesn't, restore them
      if (preservedRules && (!conn.rules || conn.rules.length === 0)) {
        console.log(`🧩✅ [FORM_WORKFLOW] Restoring ${preservedRules.length} rules for connection ${conn.id}`);
        // Create a new connection with preserved rules
        return {
          ...conn,
          rules: preservedRules
        };
      }
      
      // Otherwise return the original connection
      return conn;
    });
  }, [connections]);

  // Use the underlying workflow navigation with our rule-preserved connections
  const workflowNavigation = useWorkflowNavigation({
    blocks,
    connections: preservedConnections, // Use preserved connections with restored rules
    initialBlockIndex
  });
  
  // Store the current answer before submitting
  const [currentAnswer, setCurrentAnswer] = useState<Answer | undefined>(undefined);
  
  // Track whether the form is complete
  const [isComplete, setIsComplete] = useState(false);
  
  const {
    currentIndex,
    currentBlock,
    direction,
    goToNext: workflowGoToNext,
    goToPrevious,
    resetNavigation,
    isLastQuestion
  } = workflowNavigation;
  
  // Submit answer and navigate to next block
  const submitAnswer = useCallback((answer: Answer) => {
    if (!currentBlock) return false;
    
    // Save answer to state
    const blockId = currentBlock.id;
    setAnswers(prev => ({
      ...prev,
      [blockId]: answer
    }));
    
    console.log('🔄🧭🔍 [FORM_WORKFLOW] Submitting answer for block:', currentBlock.id, answer);
    
    // Navigate to next block based on answer
    const result = workflowGoToNext(answer);
    console.log('🔄🧭🔍 [FORM_WORKFLOW] Navigation result:', result ? 'SUCCESS' : 'FAILED');
    
    // Check if we reached the end of the form
    if (!result || isLastQuestion) {
      setIsComplete(true);
    }
    
    return result;
  }, [currentBlock, workflowGoToNext, isLastQuestion, setAnswers]);
  
  // Provide a simpler goToNext method that uses the current answer
  const goToNext = useCallback(() => {
    if (currentAnswer === undefined) {
      console.warn('Attempted to navigate with no answer');
      return false;
    }
    return submitAnswer(currentAnswer);
  }, [currentAnswer, submitAnswer]);
  
  // Get the combined answers for form submission
  const getAllAnswers = useCallback(() => {
    return answers;
  }, [answers]);
  
  return {
    // Navigation state
    currentIndex,
    direction,
    isComplete,
    currentBlock,
    
    // Navigation control
    goToNext,
    goToPrevious,
    resetNavigation,
    
    // Answer handling
    setCurrentAnswer,
    submitAnswer,
    getAllAnswers,
    answers
  };
}
