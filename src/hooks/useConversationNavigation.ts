import { useState, useCallback, useEffect } from 'react';
import { QAPair } from '@/types/supabase-types';

interface UseConversationNavigationProps {
  conversation: QAPair[];
  nextQuestion: string;
  isComplete: boolean;
  maxQuestions: number;
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
  questionInputs: Record<number, string>;
  displayQuestion: string;
  onNext?: () => void;
}

interface UseConversationNavigationReturn {
  isFirstQuestion: boolean;
  isFinalQuestion: boolean;
  isLastAnswered: boolean;
  hasReachedMaxQuestions: boolean;
  canMoveToNextQuestion: boolean;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
  moveToSpecificQuestion: (index: number) => void;
  handleCompletingConversation: () => void;
}

/**
 * Hook to manage navigation between questions in the AI conversation
 * Handles next/previous navigation and completion logic
 */
export function useConversationNavigation({
  conversation,
  nextQuestion,
  isComplete,
  maxQuestions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  questionInputs,
  displayQuestion,
  onNext,
}: UseConversationNavigationProps): UseConversationNavigationReturn {
  // Calculate derived state for navigation logic
  const isFirstQuestion = activeQuestionIndex === 0 && conversation.length === 0;
  const isFinalQuestion = isComplete || (maxQuestions > 0 && activeQuestionIndex >= maxQuestions - 1);
  const hasReachedMaxQuestions = maxQuestions > 0 && activeQuestionIndex >= maxQuestions;
  
  // Track whether the active question has been answered
  const [isLastAnswered, setIsLastAnswered] = useState(false);
  
  // Keep track of whether we can move to the next question
  const [canMoveToNextQuestion, setCanMoveToNextQuestion] = useState(false);
  
  // Move to the previous question
  const handlePreviousQuestion = useCallback(() => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  }, [activeQuestionIndex, setActiveQuestionIndex]);
  
  // Move to the next question if available
  const handleNextQuestion = useCallback(() => {
    const currentLength = conversation.length;
    
    // Only allow moving forward if there's another question or we're at the last question and have a next question
    if (activeQuestionIndex < currentLength - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else if (activeQuestionIndex === currentLength - 1 && nextQuestion) {
      // Move to the next question and set up state
      try {
        console.log('IMPORTANT: Moving to next question with:', nextQuestion.substring(0, 20) + '...');
        setActiveQuestionIndex(currentLength);
        
        // Force immediate UI update when moving to a new question
        // This is critical to maintain the expected UI flow
        if (typeof window !== 'undefined') {
          // Force any potential microtasks to complete
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('aiconversation:question-change', {
              detail: { question: nextQuestion, index: currentLength }
            }));
          }, 0);
        }
      } catch (error) {
        console.error('Error moving to next question:', error);
      }
    }
  }, [activeQuestionIndex, conversation.length, nextQuestion, setActiveQuestionIndex]);
  
  // Move to a specific question by index
  const moveToSpecificQuestion = useCallback((index: number) => {
    if (index >= 0 && index <= conversation.length) {
      setActiveQuestionIndex(index);
    }
  }, [conversation.length, setActiveQuestionIndex]);
  
  // Handle completing the conversation
  const handleCompletingConversation = useCallback(() => {
    if (onNext) {
      onNext();
    }
  }, [onNext]);
  
  // Determine if we can move to the next question based on current state
  useEffect(() => {
    // Check if the current question has an answer
    const isCurrentAnswered = activeQuestionIndex < conversation.length &&
      !!conversation[activeQuestionIndex]?.answer;
    
    // Check if we have a pending input for this question
    const hasPendingInput = !!questionInputs[activeQuestionIndex];
    
    // Check if we have a next question available
    const hasNextAvailable = activeQuestionIndex < conversation.length - 1 || 
      (activeQuestionIndex === conversation.length - 1 && !!nextQuestion);
    
    // Update state based on these conditions
    setIsLastAnswered(isCurrentAnswered);
    setCanMoveToNextQuestion(isCurrentAnswered && hasNextAvailable);
  }, [activeQuestionIndex, conversation, questionInputs, nextQuestion]);
  
  return {
    isFirstQuestion,
    isFinalQuestion,
    isLastAnswered,
    hasReachedMaxQuestions,
    canMoveToNextQuestion,
    handlePreviousQuestion,
    handleNextQuestion,
    moveToSpecificQuestion,
    handleCompletingConversation,
  };
}