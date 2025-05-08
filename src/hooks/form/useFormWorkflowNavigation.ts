/**
 * This hook is a compatibility layer that bridges useWorkflowNavigation with components
 * that expect the simpler interface of useFormNavigation.
 * 
 * It allows existing form viewer components to use the more sophisticated
 * workflow-based navigation without requiring major refactoring.
 */

import { useCallback, useState } from 'react';
import { useWorkflowNavigation } from './useWorkflowNavigation';
import { FormBlock } from '@/types/block-types';
import { Connection } from '@/types/workflow-types';

// Answer types can be varied based on the block type
type Answer = string | number | string[] | boolean | Record<string, unknown>;

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

  // Use the underlying workflow navigation
  const workflowNavigation = useWorkflowNavigation({
    blocks,
    connections,
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
    
    // Navigate to next block based on answer
    const success = workflowGoToNext(answer);
    
    // Check if we reached the end of the form
    if (!success || isLastQuestion) {
      setIsComplete(true);
    }
    
    return success;
  }, [currentBlock, workflowGoToNext, isLastQuestion]);
  
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
